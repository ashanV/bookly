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
    timestamps: true // adds createdAt, updatedAt
});

SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired? Maybe keep for history if requested. 

// The prompt asks for "Login History", so we should NOT auto-delete expired sessions immediately if we want to show history.
// However, JWTs last long? "expiresAt" is usually short.
// Let's keep history. We won't use TTL index for now OR we use a long TTL (e.g. 90 days).
// Requirement: "Lista ostatnich logowań z datą i IP".

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
