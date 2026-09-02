import mongoose, { Schema, models } from "mongoose"

const OfferSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
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
  furnitureType: {
    type: String,
    required: true
  },
  furnitureTypeOther: {
    type: String,
    default: ""
  },
  discountType: {
    type: String,
    enum: ["percent", "fixed"],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  productIds: {
    type: [String],
    default: []
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
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

const Offer = models.Offer || mongoose.model("Offer", OfferSchema)

export default Offer
