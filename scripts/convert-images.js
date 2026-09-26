#!/usr/bin/env node

/**
 * Script di conversione immagini in WebP/AVIF
 * Converte tutte le immagini nella cartella public/ in formati moderni
 * 
 * Uso: node scripts/convert-images.js
 * Requisiti: npm install sharp
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUBLIC_DIR = path.join(__dirname, '../public');
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];

// Verifica se sharp è installato
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('⚠️  Sharp non installato. Installalo con: npm install sharp --save-dev');
  process.exit(1);
}

async function convertImage(inputPath, outputPath, format, quality = 80) {
  try {
    await sharp(inputPath)
      .toFormat(format, { quality })
      .toFile(outputPath);
    console.log(`✅ Convertito: ${path.basename(inputPath)} → ${format.toUpperCase()}`);
    return true;
  } catch (error) {
    console.error(`❌ Errore conversione ${inputPath}:`, error.message);
    return false;
  }
}

async function processImages() {
  console.log('🚀 Inizio conversione immagini...\n');
  
  const files = fs.readdirSync(PUBLIC_DIR);
  const imageFiles = files.filter(file => 
    SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase()) &&
    !file.startsWith('.') &&
    !file.includes('converted')
  );

  if (imageFiles.length === 0) {
    console.log('📭 Nessuna immagine da convertire in public/');
    return;
  }

  console.log(`📁 Trovate ${imageFiles.length} immagini da convertire\n`);

  for (const file of imageFiles) {
    const inputPath = path.join(PUBLIC_DIR, file);
    const baseName = path.basename(file, path.extname(file));
    
    // Converti in WebP
    const webpPath = path.join(PUBLIC_DIR, `${baseName}.webp`);
    await convertImage(inputPath, webpPath, 'webp', 85);
    
    // Converti in AVIF (supporto più limitato, quality più basso per dimensioni minori)
    const avifPath = path.join(PUBLIC_DIR, `${baseName}.avif`);
    await convertImage(inputPath, avifPath, 'avif', 75);
  }

  console.log('\n✨ Conversione completata!');
  console.log('💡 Ricorda di aggiornare i riferimenti alle immagini nel codice per usare i nuovi formati.');
}

processImages().catch(console.error);