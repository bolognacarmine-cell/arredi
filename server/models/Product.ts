import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProductSchema = new Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  activitySector: { type: String, required: true },
  activitySectorOther: { type: String },
  furnitureType: { type: String, required: true },
  furnitureTypeOther: { type: String },
  basePrice: { type: Number, required: true },
  discountPct: { type: Number, default: null },
  images: [{ type: String }],
  sku: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
