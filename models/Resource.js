import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: ['pdf', 'whitepaper', 'guide', 'checklist', 'case-study'], default: 'pdf' },
  url: String,
  painPoints: [String],
  downloadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Resource', resourceSchema);
