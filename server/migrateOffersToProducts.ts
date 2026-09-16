// Migrazione una-tantum: le offerte (entità separata, ora rimossa) diventano
// campi promo sul prodotto collegato. La collection `offers` non viene
// cancellata ma rinominata in `offers_migrated`, così i dati restano recuperabili.
import mongoose from 'mongoose';
import { Product } from './models/Product.js';

interface LegacyOffer {
  id?: string;
  title?: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  productIds?: string[];
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

const promoValue = (o: LegacyOffer) => Number(o.discountValue) || 0;

export async function migrateOffersToProducts(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) return;

  const existing = await db.listCollections({ name: 'offers' }).toArray();
  if (existing.length === 0) return;

  const offers = (await db.collection('offers').find({}).toArray()) as LegacyOffer[];
  let migrated = 0;

  for (const offer of offers) {
    const value = promoValue(offer);
    if (value <= 0 || !Array.isArray(offer.productIds)) continue;
    // "fixed" era il nome dello sconto a importo nelle vecchie offerte.
    const discountType = offer.discountType === 'percent' ? 'percent' : 'amount';

    for (const productId of offer.productIds) {
      const product = await Product.findOne({ id: productId });
      if (!product) continue;
      // Non sovrascrive una promozione gia' impostata sulla scheda prodotto.
      if (product.promoDiscountValue) continue;

      product.promoActive = offer.active !== false;
      product.promoDiscountType = discountType;
      product.promoDiscountValue = value;
      product.promoStartDate = offer.startDate || null;
      product.promoEndDate = offer.endDate || null;
      product.promoText = offer.title || offer.description || null;
      // Lo sconto storico viene assorbito dalla promozione in scheda.
      product.discountPct = null;
      product.updatedAt = new Date();
      await product.save();
      migrated += 1;
    }
  }

  await db.collection('offers').rename('offers_migrated', { dropTarget: true });
  console.log(`Migrazione offerte completata: ${migrated} prodotti aggiornati.`);
}
