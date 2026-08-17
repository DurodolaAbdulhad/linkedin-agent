import mongoose from 'mongoose';

const dmSchema = new mongoose.Schema({
  profileId: mongoose.Schema.Types.ObjectId,
  dmText: String,
  aiGenerated: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'pending-approval', 'approved', 'sent'], default: 'draft' },
  sentDate: Date,
  receivedReply: { type: Boolean, default: false },
  replyText: String,
  replyDate: Date,
  autonomyLevel: { type: String, enum: ['manual', 'semi-auto', 'autonomous'], default: 'manual' },
  confidenceScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('DM', dmSchema);
