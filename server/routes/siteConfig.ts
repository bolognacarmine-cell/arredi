import { Router, Request, Response } from 'express';
import { SiteConfig } from '../models/SiteConfig.js';

const router = Router();

// GET all site config
router.get('/', async (req: Request, res: Response) => {
  try {
    const configs = await SiteConfig.find().sort({ createdAt: -1 });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site config' });
  }
});

// POST create site config
router.post('/', async (req: Request, res: Response) => {
  try {
    const config = new SiteConfig(req.body);
    await config.save();
    res.status(201).json(config);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create site config' });
  }
});

// PUT update site config
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await SiteConfig.findByIdAndUpdate(id, req.body, { new: true });
    if (!config) {
      res.status(404).json({ error: 'Site config not found' });
    } else {
      res.json(config);
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to update site config' });
  }
});

export default router;
