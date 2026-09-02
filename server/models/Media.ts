import mongoose, { Schema, models } from "mongoose"

const MediaSchema = new Schema({
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    enum: ["hero", "sector", "project", "gallery"],
    required: true
  },
  width: {
    type: Number,
    default: 0
  },
  height: {
    type: Number,
    default: 0
  },
  format: {
    type: String,
    default: ""
  },
  bytes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

const Media = models.Media || mongoose.model("Media", MediaSchema)

export default Media
