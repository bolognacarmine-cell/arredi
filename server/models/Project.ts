import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProjectSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  sector: { type: String, required: true },
  sectorId: { type: String, required: true },
  location: { type: String, required: true },
  year: { type: Number, required: true },
  client: { type: String },
  description: { type: String, required: true },
  image: { type: String, required: true },
  imageCloudinaryPublicId: { type: String },
  coverImages: [{ type: String }],
  galleryImages: [{ type: String }],
  galleryCloudinaryPublicIds: [{ type: String }],
  tags: [{ type: String }],
  materials: { type: String, required: true },
  status: { type: String, enum: ['bozza', 'in lavorazione', 'completato'], default: 'completato' },
  featured: { type: Boolean, default: false },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    slug: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
