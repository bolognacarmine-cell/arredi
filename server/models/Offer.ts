import mongoose from 'mongoose';

const { Schema } = mongoose;

const OfferSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
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

export const Offer = mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
