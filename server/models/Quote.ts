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

const QuoteNoteSchema = new Schema({
  text: { type: String, required: true },
  author: { type: String, default: 'system' },
  timestamp: { type: Date, default: Date.now },
});

const QuoteStatusHistorySchema = new Schema({
  previousStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  changedBy: { type: String, default: 'system' },
  note: { type: String },
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
  note: { type: String, default: '' }, // Mantenuto per compatibilità backward
  notes: { type: [QuoteNoteSchema], default: [] }, // Nuovo array di note
  statusHistory: { type: [QuoteStatusHistorySchema], default: [] }, // Nuovo storico stati
  attachments: { type: [QuoteAttachmentSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hook per migrare note vecchie (stringa) in notes array
QuoteSchema.pre('save', function(next) {
  // Se esiste note (stringa) ma notes è vuoto, migrare
  if (this.note && this.note.trim() && (!this.notes || this.notes.length === 0)) {
    this.notes.push({
      text: this.note,
      author: 'system',
      timestamp: this.createdAt || this.updatedAt || new Date(),
    });
    // Opzionale: rimuovere campo note dopo migrazione
    // this.note = '';
  }
  next();
});

export const Quote = mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
