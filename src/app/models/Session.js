import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: { type: String, required: true }, // Store hash or part of token if needed, or just JTI
    ip: { type: String },
    userAgent: { type: String },
    deviceType: { type: String }, // 'mobile', 'desktop', etc. (parsed from UA)
    browser: { type: String }, // Parsed from UA
    os: { type: String }, // Parsed from UA

    isActive: { type: Boolean, default: true },
    revokedAt: { type: Date },
    revokedBy: { type: String }, // 'user', 'admin', 'system'

    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },

    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
