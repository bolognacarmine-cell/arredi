import mongoose from 'mongoose';

const { Schema } = mongoose;

const MediaSchema = new Schema({
  cloudinaryUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  title: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['hero', 'sector', 'project', 'gallery'],
    default: 'project' 
  },
  library: { 
    type: String, 
    enum: ['Tutte', 'Prodotti', 'BANNER', 'SFONDI'],
    default: 'Tutte' 
  },
  tags: [{ type: String }],
  usedInProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  width: { type: Number },
  height: { type: Number },
  format: { type: String },
  bytes: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);
