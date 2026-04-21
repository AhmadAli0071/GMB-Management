import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  projectId: { type: String, required: true },
  fromId: { type: String, required: true },
  toId: { type: String, required: true },
  text: { type: String, default: '' },
  images: [{ filename: String, originalName: String }],
  documents: [{ filename: String, originalName: String }],
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' },
}, { versionKey: false, timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);
