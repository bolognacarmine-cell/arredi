import mongoose from 'mongoose';

const { Schema } = mongoose;

const OfferSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  activitySector: { type: String, required: true, index: true },
  activitySectorOther: { type: String },
  furnitureType: { type: String, required: true },
  furnitureTypeOther: { type: String },
  discountType: { type: String, enum: ['percent', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  productIds: { type: [String], default: [] },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  active: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Offer = mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
