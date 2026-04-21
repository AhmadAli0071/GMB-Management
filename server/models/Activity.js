import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'PROJECT_CREATED', 'PROJECT_UPDATED', 'STAGE_CHANGED', 'TASK_CREATED',
      'TASK_STATUS_CHANGED', 'REQUEST_CREATED', 'REQUEST_RESPONDED', 'UPDATE_SENT'
    ],
    required: true,
  },
  userId: { type: String, required: true },
  projectId: { type: String, default: null },
  taskId: { type: String, default: null },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { versionKey: false, timestamps: true });

export default mongoose.model('Activity', activitySchema);
