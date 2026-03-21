import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  // Participants
  userId: {
    type: String,
    default: null,
    index: true
  }, // User ID (can be null for anonymous)
  userType: {
    type: String,
    enum: ['user', 'client', 'business', 'anonymous'],
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    default: null
  },
  userAvatar: {
    type: String,
    default: null
  }, // URL to avatar or logo

  // Support
  supportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }, // Admin/moderator ID
  supportName: {
    type: String,
    default: null
  },

  // Ticket subject
  subject: {
    type: String,
    default: 'Zgłoszenie'
  },
  category: {
    type: String,
    enum: ['bug', 'question', 'complaint', 'suggestion', 'other', 'blocked', 'billing'],
    default: 'other'
  },

  // Conversation status
  status: {
    type: String,
    default: 'open',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Statistics
  messageCount: {
    type: Number,
    default: 0
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  lastMessageBy: {
    type: String,
    default: null
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  strict: true,
  validateBeforeSave: true
});

// Automatic update of updatedAt
ConversationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
ConversationSchema.index({ status: 1, createdAt: -1 });
ConversationSchema.index({ userId: 1, status: 1 });
ConversationSchema.index({ supportId: 1, status: 1 });
ConversationSchema.index({ category: 1 }); // Stats optimization
ConversationSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

// Trigger support stats update after save
ConversationSchema.post('save', async function () {
  try {
    // Dynamic import to avoid circular dependency
    const { updateSupportStats } = await import('@/lib/supportStats');
    await updateSupportStats();
  } catch (err) {
    console.error('Failed to trigger support stats update:', err);
  }
});


if (mongoose.models.Conversation) {
  delete mongoose.models.Conversation;
}
export default mongoose.model("Conversation", ConversationSchema);

