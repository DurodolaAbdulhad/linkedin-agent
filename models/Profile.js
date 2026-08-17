import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  linkedinUrl: String,
  name: String,
  title: String,
  company: String,
  location: String,
  painPoint: String,
  icpSegment: String,
  dmSentDate: Date,
  lastResponseDate: Date,
  responseCount: { type: Number, default: 0 },
  converted: { type: Boolean, default: false },
  conversionsValue: { type: Number, default: 0 },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Profile', profileSchema);
