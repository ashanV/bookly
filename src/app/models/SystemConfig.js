import mongoose from 'mongoose';

const SystemConfigSchema = new mongoose.Schema({
    // Singleton identifier - only one document will exist
    _id: {
        type: String,
        default: 'system_config'
    },

    // Boolean flags
    maintenanceMode: {
        type: Boolean,
        default: false,
        description: 'Tryb konserwacji - blokuje dostęp do aplikacji'
    },
    paymentsEnabled: {
        type: Boolean,
        default: true,
        description: 'System płatności online'
    },
    bookingsEnabled: {
        type: Boolean,
        default: true,
        description: 'Możliwość tworzenia nowych rezerwacji'
    },
    registrationEnabled: {
        type: Boolean,
        default: true,
        description: 'Rejestracja nowych użytkowników'
    },
    chatEnabled: {
        type: Boolean,
        default: true,
        description: 'System czatu z supportem'
    },

    // Text flags
    announcementEnabled: {
        type: Boolean,
        default: false,
        description: 'Włącza/wyłącza wyświetlanie ogłoszenia na stronie'
    },
    announcementText: {
        type: String,
        default: '',
        description: 'Tekst ogłoszenia wyświetlany na górze strony'
    },
    announcementType: {
        type: String,
        enum: ['info', 'warning', 'error', 'success'],
        default: 'info',
        description: 'Typ ogłoszenia (kolor)'
    },

    // Numeric flags
    maxBookingsEnabled: {
        type: Boolean,
        default: false,
        description: 'Włącza/wyłącza limit rezerwacji na dzień'
    },
    maxBookingsPerDay: {
        type: Number,
        default: 100,
        description: 'Maksymalna liczba rezerwacji dziennie'
    },
    sessionTimeoutMinutes: {
        type: Number,
        default: 1440,
        description: 'Czas wygaśnięcia sesji w minutach (domyślnie 24h)'
    },

    // Identity & Branding
    siteName: {
        type: String,
        default: 'Bookly',
        description: 'Nazwa serwisu'
    },
    contactEmail: {
        type: String,
        default: 'kontakt@bookly.pl',
        description: 'Email kontaktowy (główny)'
    },
    supportEmail: {
        type: String,
        description: 'Email do supportu (opcjonalny)'
    },
    socialLinks: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedin: String
    },
    logoUrl: {
        type: String,
        description: 'URL do logo serwisu'
    },
    faviconUrl: {
        type: String,
        description: 'URL do favicony'
    },

    // Monetization
    commissionRate: {
        type: Number,
        default: 10,
        min: 0,
        max: 100,
        description: 'Globalna stawka prowizji (%)'
    },
    currency: {
        type: String,
        default: 'PLN',
        enum: ['PLN', 'EUR', 'USD'],
        description: 'Waluta serwisu'
    }
}, {
    timestamps: true,
    collection: 'system_config'
});

// Static method to get or create the singleton config
SystemConfigSchema.statics.getConfig = async function () {
    let config = await this.findById('system_config');
    if (!config) {
        config = await this.create({ _id: 'system_config' });
    }
    return config;
};

// Static method to update config
SystemConfigSchema.statics.updateConfig = async function (updates) {
    const config = await this.findByIdAndUpdate(
        'system_config',
        { $set: updates },
        { new: true, upsert: true, runValidators: true }
    );
    return config;
};

export default mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);
