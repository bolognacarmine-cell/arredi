import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Offer } from '../models/Offer.js';
import { Product } from '../models/Product.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// Gli id applicativi (es. "o8xtyb21tj") non sono ObjectId: includerli nel ramo
// _id farebbe fallire la query con un CastError.
const byId = (id: string) =>
  mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { id }] } : { id };

const errMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

// Le offerte referenziano i prodotti con l'id applicativo: un id inesistente
// produrrebbe un'offerta invisibile in vetrina.
async function findMissingProductIds(productIds: unknown): Promise<string[]> {
  if (!Array.isArray(productIds) || productIds.length === 0) return [];
  const ids = productIds.map((value) => String(value));
  const known = new Set<string>(
    await Product.distinct('id', { id: { $in: ids } }),
  );
  return ids.filter((id) => !known.has(id));
}

// GET all offers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { activitySector, active } = req.query;
    const filter: Record<string, unknown> = {};

    if (activitySector) {
      filter.activitySector = activitySector;
    }
    if (active !== undefined) {
      const activeStr = String(active).toLowerCase();
      filter.active = activeStr === 'true' || activeStr === '1';
    }

    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch offers' });
  }
});

// GET single offer by id or _id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findOne(byId(id));
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.json({ success: true, data: offer });
  } catch (error) {
    res.status(400).json({ success: false, message: errMessage(error) });
  }
});

// POST create offer
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const missing = await findMissingProductIds(req.body?.productIds);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Prodotti non trovati: ${missing.join(', ')}`,
      });
    }
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json({ success: true, data: offer.toObject() });
  } catch (error) {
    res.status(400).json({ success: false, message: errMessage(error) });
  }
});

// PUT update offer
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (req.body?.productIds !== undefined) {
      const missing = await findMissingProductIds(req.body.productIds);
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Prodotti non trovati: ${missing.join(', ')}`,
        });
      }
    }
    const offer = await Offer.findOneAndUpdate(
      byId(id),
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!offer) {
      res.status(404).json({ success: false, message: 'Offer not found' });
    } else {
      res.json({ success: true, data: offer });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: errMessage(error) });
  }
});

// DELETE offer
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findOneAndDelete(byId(id));
    if (!offer) {
      res.status(404).json({ success: false, message: 'Offer not found' });
    } else {
      res.json({ success: true, message: 'Offer deleted' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: errMessage(error) });
  }
});

export default router;
