import mongoose from 'mongoose';

const leadWorkSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  projectId: { type: String, required: true },
  userId: { type: String, required: true },
  section: { type: String, enum: ['ON_PAGE'], default: 'ON_PAGE' },
  text: { type: String, default: '' },
  files: [{ filename: String, originalName: String }],
  status: { type: String, enum: ['DRAFT', 'INCLUDED'], default: 'DRAFT' },
  workDate: { type: String, default: '' },
}, { versionKey: false, timestamps: true });

export default mongoose.model('LeadWork', leadWorkSchema);
