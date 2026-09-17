import mongoose from 'mongoose';

const { Schema } = mongoose;

const QuoteAttachmentSchema = new Schema({
  url: { type: String, required: true },
  secureUrl: { type: String },
  publicId: { type: String },
  originalName: { type: String },
  mimeType: { type: String },
  bytes: { type: Number },
  width: { type: Number },
  height: { type: Number },
});

const QuoteSchema = new Schema({
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  azienda: { type: String, default: '' },
  settore: { type: String, default: '' },
  email: { type: String, required: true },
  telefono: { type: String, default: '' },
  data: { type: String, required: true },
  stato: { type: String, enum: ['nuovo', 'contattato', 'chiuso'], default: 'nuovo' },
  metratura: { type: String, default: '' },
  arredo: { type: String, default: '' },
  messaggio: { type: String, default: '' },
  note: { type: String, default: '' },
  attachments: { type: [QuoteAttachmentSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Quote = mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
