import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  // Konwersacja
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },

  // Nadawca
  senderId: {
    type: String,
    required: true
  }, // ID użytkownika lub 'support' dla admina
  senderType: {
    type: String,
    enum: ['user', 'client', 'business', 'support', 'anonymous'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderEmail: {
    type: String,
    default: null
  },

  // Treść wiadomości
  message: {
    type: String,
    required: false,
    default: ''
  },

  // Multimedia
  fileUrl: { type: String, default: null },
  fileName: { type: String, default: null },
  fileSize: { type: Number, default: null },
  gifUrl: { type: String, default: null },

  // Typ wiadomości
  type: {
    type: String,
    enum: ['message', 'system', 'file', 'image', 'gif'],
    default: 'message'
  },

  // Status
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  strict: true,
  validateBeforeSave: true
});

// Indeksy dla szybkiego wyszukiwania
ChatMessageSchema.index({ conversationId: 1, createdAt: -1 });
ChatMessageSchema.index({ senderId: 1, createdAt: -1 });

export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);

