#!/usr/bin/env node
/**
 * Create Admin Script
 * Usage: npm run create-admin
 * 
 * Creates the first admin user with a randomly generated PIN
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI nie jest zdefiniowany w .env.local');
    process.exit(1);
}

// User Schema (simplified for script)
const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    adminRole: { type: String, enum: ['admin', 'moderator', 'developer', null] },
    adminPin: String,
    adminPermissions: [String],
    isAdminActive: Boolean,
    isActive: Boolean,
    createdAt: Date,
    updatedAt: Date
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Generate random 6-digit PIN
function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create readline interface for user input
function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

// Prompt user for input (simple version)
function prompt(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function main() {
    console.log('\n🔐 Tworzenie konta administratora Bookly\n');
    console.log('─'.repeat(50));

    const rl = createInterface();

    try {
        // Connect to MongoDB
        console.log('📡 Łączenie z bazą danych...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Połączono z MongoDB\n');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ adminRole: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  UWAGA: Istnieje już użytkownik z rolą admin!');
            console.log(`   Email: ${existingAdmin.email}`);
            const proceed = await prompt(rl, '\nCzy chcesz utworzyć kolejnego admina? (tak/nie): ');
            if (proceed.toLowerCase() !== 'tak') {
                console.log('\n❌ Anulowano tworzenie admina.');
                rl.close();
                await mongoose.disconnect();
                process.exit(0);
            }
        }

        // Get user details
        const email = await prompt(rl, 'Email: ');

        // Validate email
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            console.log('❌ Nieprawidłowy format email');
            rl.close();
            await mongoose.disconnect();
            process.exit(1);
        }

        // Check if email exists
        const existingUser = await User.findOne({ email });

        let user;
        if (existingUser) {
            console.log(`\n📋 Znaleziono istniejącego użytkownika: ${existingUser.firstName} ${existingUser.lastName}`);
            const upgrade = await prompt(rl, 'Czy chcesz nadać mu uprawnienia admina? (tak/nie): ');

            if (upgrade.toLowerCase() !== 'tak') {
                console.log('\n❌ Anulowano.');
                rl.close();
                await mongoose.disconnect();
                process.exit(0);
            }

            user = existingUser;
        } else {
            // Create new user
            const firstName = await prompt(rl, 'Imię: ');
            const lastName = await prompt(rl, 'Nazwisko: ');
            const password = await prompt(rl, 'Hasło: ');
            const passwordConfirm = await prompt(rl, 'Powtórz hasło: ');

            if (password !== passwordConfirm) {
                console.log('\n❌ Hasła nie są identyczne');
                rl.close();
                await mongoose.disconnect();
                process.exit(1);
            }

            if (password.length < 8) {
                console.log('\n❌ Hasło musi mieć minimum 8 znaków');
                rl.close();
                await mongoose.disconnect();
                process.exit(1);
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Generate and hash PIN
        const pin = generatePin();
        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash(pin, salt);

        // Set admin fields
        user.adminRole = 'admin';
        user.adminPin = hashedPin;
        user.adminPermissions = [];
        user.isAdminActive = true;
        user.updatedAt = new Date();

        await user.save();

        rl.close();

        console.log('\n' + '═'.repeat(50));
        console.log('✅ KONTO ADMINISTRATORA UTWORZONE!');
        console.log('═'.repeat(50));
        console.log(`\n📧 Email: ${user.email}`);
        console.log(`👤 Imię i nazwisko: ${user.firstName} ${user.lastName}`);
        console.log('\n' + '─'.repeat(50));
        console.log(`📌 TWÓJ PIN: ${pin}`);
        console.log('─'.repeat(50));
        console.log('\n⚠️  WAŻNE: Zapisz ten PIN w bezpiecznym miejscu!');
        console.log('   PIN NIE BĘDZIE POKAZANY PONOWNIE!');
        console.log('\n🔑 Aby zalogować się do panelu admin:');
        console.log('   1. Użyj skrótu Ctrl+Shift+A na stronie');
        console.log('   2. Lub przejdź na /admin/login');
        console.log('   3. Podaj email, hasło i PIN\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Błąd:', error.message);
        rl.close();
        await mongoose.disconnect();
        process.exit(1);
    }
}

main();
