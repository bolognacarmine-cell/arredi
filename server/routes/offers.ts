import { Router, Request, Response } from 'express';
import { Offer } from '../models/Offer.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// GET all offers
router.get('/', async (req: Request, res: Response) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// POST create offer
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create offer' });
  }
});

// PUT update offer
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndUpdate(id, req.body, { new: true });
    if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
    } else {
      res.json(offer);
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to update offer' });
  }
});

// DELETE offer
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
    } else {
      res.json({ message: 'Offer deleted' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete offer' });
  }
});

export default router;
