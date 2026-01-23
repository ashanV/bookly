import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  // Uczestnicy
  userId: {
    type: String,
    default: null,
    index: true
  }, // ID użytkownika (może być null dla anonimowych)
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
  }, // URL do awatara lub loga

  // Support
  supportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }, // ID admina/moderatora obsługującego
  supportName: {
    type: String,
    default: null
  },

  // Temat zgłoszenia
  subject: {
    type: String,
    default: 'Zgłoszenie'
  },
  category: {
    type: String,
    enum: ['bug', 'question', 'complaint', 'suggestion', 'other', 'blocked', 'billing'],
    default: 'other'
  },

  // Status konwersacji
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

  // Statystyki
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

// Automatyczna aktualizacja updatedAt
ConversationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indeksy
ConversationSchema.index({ status: 1, createdAt: -1 });
ConversationSchema.index({ userId: 1, status: 1 });
ConversationSchema.index({ supportId: 1, status: 1 });
ConversationSchema.index({ category: 1 }); // Stats optimization
ConversationSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-usuwanie po 30 dniach

// Trigger support stats update after save
ConversationSchema.post('save', async function () {
  try {
    // Dynamic import to avoid circular dependency
    const { updateSupportStats } = await import('@/lib/supportStats');
    // Fire and forget (don't await to block response, or await if consistency required)
    // For admin dashboard, "eventual consistency" (ms latency) is fine.
    // However, in serverless, "fire and forget" might be killed if function ends.
    // Next.js (Vercel) usually waits for promises in `waitUntil` but here we are in a model hook.
    // Best effort: await it. It should be fast (Redis set + Pusher trigger).
    // The "heavy" calculation part is inside updateSupportStats. 
    // If we want to make it fast for the user saving the ticket, we should optimistically return.
    // But since we removed the polling, we need this to run.
    await updateSupportStats();
  } catch (err) {
    console.error('Failed to trigger support stats update:', err);
  }
});


if (mongoose.models.Conversation) {
  delete mongoose.models.Conversation;
}
export default mongoose.model("Conversation", ConversationSchema);

