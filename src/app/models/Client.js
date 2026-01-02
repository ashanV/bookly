import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    // Reference to owning business
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true
    },

    // Basic profile
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String, default: '' }, // Initials or image URL

    // Contact info
    email: {
        type: String,
        default: '',
        match: [/^$|^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    phone: { type: String, default: '' },
    phonePrefix: { type: String, default: '+48' },

    // Additional contact
    additionalEmail: { type: String, default: '' },
    additionalPhone: { type: String, default: '' },
    additionalPhonePrefix: { type: String, default: '+48' },

    // Personal details
    birthDate: { type: String, default: '' }, // Day and month
    birthYear: { type: String, default: '' },
    gender: { type: String, enum: ['', 'Kobieta', 'Mężczyzna', 'Inna'], default: '' },
    pronouns: { type: String, enum: ['', 'Ona/Jej', 'On/Jego'], default: '' },

    // Referral info
    referralSource: {
        type: String,
        enum: ['Bez rezerwacji', 'Instagram', 'Google', 'Polecenie znajomego', 'Inne'],
        default: 'Bez rezerwacji'
    },
    referredBy: { type: String, default: '' }, // Client ID or name

    // Additional info
    preferredLanguage: { type: String, default: '' },
    occupation: { type: String, default: '' },
    country: { type: String, default: '' },

    // Addresses
    addresses: [{
        street: String,
        houseNumber: String,
        apartmentNumber: String,
        city: String,
        postCode: String,
        country: String,
        type: { type: String, default: 'Dom' }
    }],

    // Emergency Contacts
    emergencyContacts: [{
        name: String,
        relationship: String,
        email: String,
        phone: String,
        type: { type: String, default: 'main' } // 'main' or 'secondary'
    }],

    // Consent & Settings
    consent: {
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            whatsapp: { type: Boolean, default: true }
        },
        marketing: {
            email: { type: Boolean, default: false },
            sms: { type: Boolean, default: false },
            whatsapp: { type: Boolean, default: false }
        }
    },

    // Tags and notes
    tags: [{ type: String }],
    notes: { type: String, default: '' },

    // Status
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        index: true
    },

    // Statistics (will be updated by reservations)
    totalSpent: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
    lastVisit: { type: Date, default: null },
    rating: { type: Number, default: 0, min: 0, max: 5 },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    strict: true,
    validateBeforeSave: true
});

// Update timestamp on save
ClientSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Generate avatar from initials if not set
    if (!this.avatar && this.firstName && this.lastName) {
        this.avatar = `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
    }

    next();
});

// Index for searching
ClientSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// Delete cached model to force schema refresh (useful during development)
if (mongoose.models.Client) {
    delete mongoose.models.Client;
}

export default mongoose.model("Client", ClientSchema);
