import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  category: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
