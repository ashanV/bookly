import mongoose from 'mongoose';

const PayoutSchema = new mongoose.Schema({
    // Business receiving the payout
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },

    // Financials
    amount: {
        type: Number,
        required: true,
        description: 'Kwota wypłacona biznesowi (GMV - Prowizja)'
    },
    commissionAmount: {
        type: Number,
        required: true,
        description: 'Prowizja zatrzymana przez platformę'
    },
    currency: {
        type: String,
        default: 'PLN'
    },

    // Metadata
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    method: {
        type: String,
        default: 'transfer',
        description: 'Metoda płatności (przelew, itp.)'
    },

    // Settlement Period
    periodStart: {
        type: Date,
        required: true
    },
    periodEnd: {
        type: Date,
        required: true
    },
    reservationsCount: {
        type: Number,
        default: 0
    },

    // Additional Info
    notes: {
        type: String,
        default: ''
    },
    transactionId: {
        type: String,
        description: 'Zewnętrzny ID transakcji bankowej'
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.models.Payout || mongoose.model('Payout', PayoutSchema);
