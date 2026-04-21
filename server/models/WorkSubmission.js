import mongoose from 'mongoose';

const workSubmissionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  assignmentId: { type: String, required: true },
  projectId: { type: String, required: true },
  fromId: { type: String, required: true },
  toId: { type: String, required: true },
  text: { type: String, default: '' },
  files: [{ filename: String, originalName: String }],
  status: { type: String, enum: ['PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'], default: 'PENDING_REVIEW' },
  reviewComment: { type: String, default: '' },
}, { versionKey: false, timestamps: true });

export default mongoose.model('WorkSubmission', workSubmissionSchema);
