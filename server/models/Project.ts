import mongoose, { Schema, models } from "mongoose"

const ProjectSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    required: true
  },
  sectorId: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  client: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  imageCloudinaryPublicId: {
    type: String,
    default: ""
  },
  gallery: {
    type: [String],
    default: []
  },
  galleryCloudinaryPublicIds: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  materials: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["bozza", "in lavorazione", "completato"],
    default: "completato"
  },
  featured: {
    type: Boolean,
    default: false
  },
  seo: {
    metaTitle: {
      type: String,
      default: ""
    },
    metaDescription: {
      type: String,
      default: ""
    },
    slug: {
      type: String,
      default: ""
    }
  }
}, {
  timestamps: true
})

const Project = models.Project || mongoose.model("Project", ProjectSchema)

export default Project
