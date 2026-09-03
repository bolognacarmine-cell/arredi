import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  images: [{ type: String }],
  category: { type: String, default: '' },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
