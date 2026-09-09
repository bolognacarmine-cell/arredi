import { Router, Request, Response } from 'express';
import { Media } from '../models/Media.js';

const router = Router();

// GET all media with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { library, search, category } = req.query;
    const filter: any = {};
    
    if (library && library !== 'Tutte') {
      filter.library = library;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { cloudinaryPublicId: { $regex: search, $options: 'i' } },
      ];
    }
    
    const media = await Media.find(filter).sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// POST create media
router.post('/', async (req: Request, res: Response) => {
  try {
    const { cloudinaryUrl, cloudinaryPublicId, title, category } = req.body;
    const media = new Media({ cloudinaryUrl, cloudinaryPublicId, title, category });
    await media.save();
    res.status(201).json(media);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create media' });
  }
});

// PUT update media
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const media = await Media.findByIdAndUpdate(id, updates, { new: true });
    if (!media) {
      res.status(404).json({ error: 'Media not found' });
    } else {
      res.json(media);
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to update media' });
  }
});

// DELETE media
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = await Media.findByIdAndDelete(id);
    if (!media) {
      res.status(404).json({ error: 'Media not found' });
    } else {
      res.json({ message: 'Media deleted' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete media' });
  }
});

export default router;
