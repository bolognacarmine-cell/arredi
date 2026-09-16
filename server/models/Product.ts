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
  // Promozione in scheda prodotto: tutti i campi sono opzionali.
  promoActive: { type: Boolean, default: false },
  promoDiscountType: { type: String, enum: ['percent', 'amount', null], default: null },
  promoDiscountValue: { type: Number, default: null, min: 0 },
  promoStartDate: { type: String, default: null },
  promoEndDate: { type: String, default: null },
  promoText: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
