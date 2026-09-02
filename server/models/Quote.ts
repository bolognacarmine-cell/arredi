import mongoose, { Schema, models } from "mongoose"

const QuoteItemSchema = new Schema({
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
})

const QuoteSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    default: ""
  },
  items: {
    type: [QuoteItemSchema],
    default: []
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"
  },
  notes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
})

const Quote = models.Quote || mongoose.model("Quote", QuoteSchema)

export default Quote
