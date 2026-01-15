import mongoose from 'mongoose';

const BlockedIpSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    reason: {
        type: String,
        default: 'Ręczna blokada przez administratora'
    },
    blockedBy: {
        type: String, // Email of the admin who blocked it
        default: 'System'
    },
}, {
    timestamps: true
});

export default mongoose.models.BlockedIp || mongoose.model('BlockedIp', BlockedIpSchema);
