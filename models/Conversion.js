import mongoose from 'mongoose';

const conversionSchema = new mongoose.Schema({
  profileId: mongoose.Schema.Types.ObjectId,
  dmId: mongoose.Schema.Types.ObjectId,
  conversionType: { type: String, enum: ['meeting-booked', 'consulting-client', 'guide-purchased'], default: 'meeting-booked' },
  value: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'completed', 'lost'], default: 'pending' },
  meetingDate: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Conversion', conversionSchema);
