import mongoose from 'mongoose';

const { Schema } = mongoose;

const MediaSchema = new Schema({
  cloudinaryUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  title: { type: String, default: '' },
  category: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);
