import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['SALES_MANAGER', 'SEO_MANAGER', 'SEO_LEAD', 'OFF_PAGE_SPECIALIST', 'INTERN', 'BOSS'],
  },
  avatar: String,
}, { versionKey: false, timestamps: true });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
