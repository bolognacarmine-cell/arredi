import mongoose, { Schema, models } from "mongoose"

const ProductSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  activitySector: {
    type: String,
    required: true
  },
  activitySectorOther: {
    type: String,
    default: ""
  },
  furnitureType: {
    type: String,
    required: true
  },
  furnitureTypeOther: {
    type: String,
    default: ""
  },
  basePrice: {
    type: Number,
    required: true
  },
  discountPct: {
    type: Number,
    default: null
  },
  images: {
    type: [String],
    default: []
  },
  sku: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const Product = models.Product || mongoose.model("Product", ProductSchema)

export default Product
