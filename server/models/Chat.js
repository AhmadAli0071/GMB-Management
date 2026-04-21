import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  conversationId: { type: String, default: '', index: true },
  projectId: { type: String, default: '' },
  senderId: { type: String, required: true },
  text: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileType: { type: String, default: '' },
  voiceUrl: { type: String, default: '' },
  voiceDuration: { type: Number, default: 0 },
  type: { type: String, enum: ['TEXT', 'FILE', 'VOICE'], default: 'TEXT' },
  edited: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  hiddenBy: [{ type: String }],
}, { versionKey: false, timestamps: true });

export default mongoose.model('Chat', chatSchema);
