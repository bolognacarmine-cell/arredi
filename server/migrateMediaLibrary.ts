import mongoose from 'mongoose';
import { Media } from './models/Media.js';
import { config } from 'dotenv';

// Carica variabili d'ambiente
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arredi';

async function migrateMediaLibrary() {
  try {
    console.log('🔄 Connessione al database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connesso al database');

    // Trova tutti i media senza campo library
    const mediaWithoutLibrary = await Media.find({ library: { $exists: false } });
    
    console.log(`📊 Trovati ${mediaWithoutLibrary.length} media senza campo library`);

    if (mediaWithoutLibrary.length === 0) {
      console.log('✨ Nessuna migrazione necessaria');
      process.exit(0);
    }

    // Aggiorna tutti i media esistenti con library='Tutte'
    const updateResult = await Media.updateMany(
      { library: { $exists: false } },
      { $set: { library: 'Tutte' } }
    );

    console.log(`✅ Aggiornati ${updateResult.modifiedCount} media con library='Tutte'`);

    // Verifica
    const allMedia = await Media.find({});
    const withLibrary = await Media.countDocuments({ library: { $exists: true } });
    
    console.log(`📊 Statistiche finali:`);
    console.log(`   - Totale media: ${allMedia.length}`);
    console.log(`   - Media con library: ${withLibrary}`);
    console.log(`   - Media senza library: ${allMedia.length - withLibrary}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    process.exit(1);
  }
}

migrateMediaLibrary();
