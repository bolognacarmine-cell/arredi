import { Router, Request, Response } from 'express';
import { Media } from '../models/Media.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// GET all media with optional filtering
router.get('/', async (req: Request, res: Response) => {
  // Security: Ensure only GET method is accepted
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }
  
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
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only POST method is accepted
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }
  
  try {
    // Security: Basic input validation
    if (req.body.title && typeof req.body.title === 'string') {
      if (req.body.title.length > 500) {
        return res.status(400).json({ 
          error: 'Media title too long (max 500 characters)' 
        });
      }
    }
    
    if (req.body.category && typeof req.body.category === 'string') {
      if (req.body.category.length > 100) {
        return res.status(400).json({ 
          error: 'Category too long (max 100 characters)' 
        });
      }
    }
    
    if (req.body.cloudinaryUrl && typeof req.body.cloudinaryUrl === 'string') {
      if (req.body.cloudinaryUrl.length > 1000) {
        return res.status(400).json({ 
          error: 'Cloudinary URL too long (max 1000 characters)' 
        });
      }
    }
    
    if (req.body.cloudinaryPublicId && typeof req.body.cloudinaryPublicId === 'string') {
      if (req.body.cloudinaryPublicId.length > 500) {
        return res.status(400).json({ 
          error: 'Cloudinary public ID too long (max 500 characters)' 
        });
      }
    }
    
    const { cloudinaryUrl, cloudinaryPublicId, title, category } = req.body;
    const media = new Media({ cloudinaryUrl, cloudinaryPublicId, title, category });
    await media.save();
    res.status(201).json(media);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create media' });
  }
});

// PUT update media
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only PUT method is accepted
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { id } = req.params;
    
    // Security: Basic input validation
    if (req.body.title && typeof req.body.title === 'string') {
      if (req.body.title.length > 500) {
        return res.status(400).json({ 
          error: 'Media title too long (max 500 characters)' 
        });
      }
    }
    
    if (req.body.category && typeof req.body.category === 'string') {
      if (req.body.category.length > 100) {
        return res.status(400).json({ 
          error: 'Category too long (max 100 characters)' 
        });
      }
    }
    
    if (req.body.cloudinaryUrl && typeof req.body.cloudinaryUrl === 'string') {
      if (req.body.cloudinaryUrl.length > 1000) {
        return res.status(400).json({ 
          error: 'Cloudinary URL too long (max 1000 characters)' 
        });
      }
    }
    
    if (req.body.cloudinaryPublicId && typeof req.body.cloudinaryPublicId === 'string') {
      if (req.body.cloudinaryPublicId.length > 500) {
        return res.status(400).json({ 
          error: 'Cloudinary public ID too long (max 500 characters)' 
        });
      }
    }
    
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
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only DELETE method is accepted
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }
  
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
