import { Router, Request, Response } from 'express';
import { Quote } from '../models/Quote.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// GET all quotes
router.get('/', async (req: Request, res: Response) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quotes' });
  }
});

// POST create quote (public endpoint for form submissions)
router.post('/', async (req: Request, res: Response) => {
  try {
    const quote = new Quote(req.body);
    await quote.save();
    res.status(201).json({ success: true, data: quote });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create quote' });
  }
});

// PUT update quote
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByIdAndUpdate(id, req.body, { new: true });
    if (!quote) {
      res.status(404).json({ success: false, message: 'Quote not found' });
    } else {
      res.json({ success: true, data: quote });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update quote' });
  }
});

// PATCH update quote status
router.patch('/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stato } = req.body;

    if (!stato || !['nuovo', 'contattato', 'chiuso'].includes(stato)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const quote = await Quote.findByIdAndUpdate(
      id,
      { stato, updatedAt: new Date() },
      { new: true }
    );

    if (!quote) {
      res.status(404).json({ success: false, message: 'Quote not found' });
    } else {
      res.json({ success: true, data: quote });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update quote status' });
  }
});

// DELETE quote
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByIdAndDelete(id);
    if (!quote) {
      res.status(404).json({ success: false, message: 'Quote not found' });
    } else {
      res.json({ success: true, message: 'Quote deleted' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete quote' });
  }
});

export default router;
