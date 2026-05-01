import mongoose from 'mongoose';

const projectUpdateSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  projectId: { type: String, required: true },
  fromId: { type: String, required: true },
  toId: { type: String, required: true },
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  files: [{ filename: String, originalName: String }],
  status: { type: String, enum: ['PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'], default: 'PENDING_REVIEW' },
  reviewComment: { type: String, default: '' },
  reportType: { type: String, enum: ['SIMPLE', 'STRUCTURED'], default: 'SIMPLE' },
  onPageText: { type: String, default: '' },
  onPageFiles: [{ filename: String, originalName: String }],
  offPageWorkIds: [String],
  onPageStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  offPageStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  onPageComment: { type: String, default: '' },
  offPageComment: { type: String, default: '' },
  workDate: { type: String, default: '' },
}, { versionKey: false, timestamps: true });

export default mongoose.model('ProjectUpdate', projectUpdateSchema);
