import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  businessCategory: { type: String, default: '' },
  businessAddress: { type: String, default: '' },
  businessCity: { type: String, default: '' },
  businessState: { type: String, default: '' },
  businessZip: { type: String, default: '' },
  businessPhone: { type: String, default: '' },
  businessEmail: { type: String, default: '' },
  businessWebsite: { type: String, default: '' },
  googleMapsLink: { type: String, default: '' },
  yelpLink: { type: String, default: '' },
  homeAdvisorLink: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['VERIFIED', 'UNVERIFIED'], default: 'UNVERIFIED' },
  targetKeywords: { type: String, default: '' },
  competitors: { type: String, default: '' },
  businessHours: { type: String, default: '' },
  services: { type: String, default: '' },
  offerServices: { type: String, default: '' },
  serviceAreas: { type: String, default: '' },
  currentReviews: { type: Number, default: 0 },
  currentRating: { type: Number, default: 0 },
  specialInstructions: { type: String, default: '' },
  signupDate: { type: String, default: '' },
  managerComment: { type: String, default: '' },
  stage: {
    type: String,
    enum: [
      'CLIENT_COMMUNICATION', 'VERIFICATION', 'READY_FOR_ASSIGNMENT',
      'ASSIGNED_TO_LEAD', 'ON_PAGE_IN_PROGRESS', 'OFF_PAGE_IN_PROGRESS',
      'REVIEW', 'COMPLETED'
    ],
    default: 'CLIENT_COMMUNICATION',
  },
  assignedTo: [{ type: String, default: [] }],
  createdBy: { type: String, required: true },
  lastUpdate: { type: Date, default: Date.now },
}, { versionKey: false, timestamps: true });

export default mongoose.model('Project', projectSchema);
