import mongoose from "mongoose";

const AdminLogSchema = new mongoose.Schema({
    // User performing the action
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userEmail: { type: String, required: true },
    userRole: { type: String, required: true },

    // Action
    action: {
        type: String,
        required: true,
        enum: [
            // Users
            'user_viewed', 'user_edited', 'user_deleted', 'user_banned', 'user_unbanned', 'user_registered',
            // Businesses
            'business_created', 'business_viewed', 'business_edited', 'business_deleted', 'business_verified', 'business_rejected',
            // Clients
            'client_created',
            // Employees
            'employee_created', 'employee_deleted',
            // Services
            'service_created', 'service_updated', 'service_deleted',
            // Reservations
            'reservation_viewed', 'reservation_cancelled', 'dispute_resolved',
            // Support
            'ticket_viewed', 'ticket_responded', 'ticket_closed', 'ticket_assigned',
            // Reviews
            'review_deleted',
            // Finance
            'finance_viewed', 'payout_processed', 'payment_success', 'payment_failed', 'subscription_cancelled',
            // Settings
            'settings_changed',
            // Role
            'role_granted', 'role_revoked',
            // Developer
            'feature_flag_toggled', 'cache_cleared',
            // Auth
            'admin_login', 'admin_logout', 'admin_login_failed',
            'pin_sent'
        ]
    },

    // Target of the action
    targetType: {
        type: String,
        enum: ['user', 'business', 'client', 'employee', 'reservation', 'ticket', 'review', 'settings', 'feature_flag', 'cache', 'auth']
    },
    targetId: { type: mongoose.Schema.Types.ObjectId },

    // Details
    details: { type: mongoose.Schema.Types.Mixed },

    // Metadata
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: false
});

// Indexes for fast searching
AdminLogSchema.index({ userId: 1, timestamp: -1 });
AdminLogSchema.index({ action: 1, timestamp: -1 });
AdminLogSchema.index({ targetType: 1, targetId: 1 });
AdminLogSchema.index({ timestamp: -1 });

export default mongoose.models.AdminLog || mongoose.model("AdminLog", AdminLogSchema);
