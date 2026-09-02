import { Router, Request, Response } from 'express';
import { Quote } from '../models/Quote';

const router = Router();

// GET all quotes
router.get('/', async (req: Request, res: Response) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// POST create quote
router.post('/', async (req: Request, res: Response) => {
  try {
    const quote = new Quote(req.body);
    await quote.save();
    res.status(201).json(quote);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create quote' });
  }
});

// PUT update quote
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByIdAndUpdate(id, req.body, { new: true });
    if (!quote) {
      res.status(404).json({ error: 'Quote not found' });
    } else {
      res.json(quote);
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to update quote' });
  }
});

// DELETE quote
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByIdAndDelete(id);
    if (!quote) {
      res.status(404).json({ error: 'Quote not found' });
    } else {
      res.json({ message: 'Quote deleted' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete quote' });
  }
});

export default router;
