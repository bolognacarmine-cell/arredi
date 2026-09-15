import { Router, Request, Response } from 'express';
import { Offer } from '../models/Offer.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// GET all offers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { activitySector, active } = req.query;
    const filter: any = {};

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
    const offer = await Offer.findOne({ $or: [{ _id: id }, { id }] });
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.json({ success: true, data: offer });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to fetch offer' });
  }
});

// POST create offer
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json({ success: true, data: offer.toObject() });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create offer' });
  }
});

// PUT update offer
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      req.body,
      { new: true, runValidators: true }
    );
    if (!offer) {
      res.status(404).json({ success: false, message: 'Offer not found' });
    } else {
      res.json({ success: true, data: offer });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update offer' });
  }
});

// DELETE offer
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findOneAndDelete({ $or: [{ _id: id }, { id }] });
    if (!offer) {
      res.status(404).json({ success: false, message: 'Offer not found' });
    } else {
      res.json({ success: true, message: 'Offer deleted' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete offer' });
  }
});

export default router;
