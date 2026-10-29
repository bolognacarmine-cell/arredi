import mongoose from 'mongoose';

const { Schema } = mongoose;

const RestoSudContactSchema = new Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 200 },
  email: { type: String, default: '', trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, default: '', trim: true, maxlength: 50 },
  message: { type: String, default: '', trim: true, maxlength: 2000 },
  privacyConsent: { type: Boolean, required: true },
  source: { type: String, default: 'resto-al-sud-2-0' },
  createdAt: { type: Date, default: Date.now },
});

RestoSudContactSchema.index({ createdAt: -1 });

export const RestoSudContact =
  mongoose.models.RestoSudContact ||
  mongoose.model('RestoSudContact', RestoSudContactSchema);
