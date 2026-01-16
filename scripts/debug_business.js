const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("MONGODB_URI is missing in .env.local");
    process.exit(1);
}

const BusinessSchema = new mongoose.Schema({}, { strict: false });
const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

async function checkBusiness() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB");

        // ID from user log
        const id = '690b8ebad9dfa76073473f9b';

        const business = await Business.findById(id);
        console.log("Business Data:");
        if (business) {
            console.log("ID:", business._id);
            console.log("Company:", business.companyName);
            console.log("IsBlocked:", business.isBlocked);
            console.log("BlockReason:", business.blockReason);
            console.log("Full Object:", JSON.stringify(business, null, 2));
        } else {
            console.log("Business not found");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkBusiness();
