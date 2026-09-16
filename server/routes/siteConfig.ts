import { Router, Request, Response } from 'express';
import { SiteConfig } from '../models/SiteConfig.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// GET all site config
router.get('/', async (req: Request, res: Response) => {
  // Security: Ensure only GET method is accepted
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const configs = await SiteConfig.find().sort({ createdAt: -1 });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site config' });
  }
});

// POST create site config
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only POST method is accepted
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }
  
  try {
    // Security: Basic input validation
    if (req.body.name && typeof req.body.name === 'string') {
      if (req.body.name.length > 200) {
        return res.status(400).json({ 
          error: 'Config name too long (max 200 characters)' 
        });
      }
    }
    
    if (req.body.value && typeof req.body.value === 'string') {
      if (req.body.value.length > 5000) {
        return res.status(400).json({ 
          error: 'Config value too long (max 5000 characters)' 
        });
      }
    }
    
    const config = new SiteConfig(req.body);
    await config.save();
    res.status(201).json(config);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create site config' });
  }
});

// PUT update site config
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
    if (req.body.name && typeof req.body.name === 'string') {
      if (req.body.name.length > 200) {
        return res.status(400).json({ 
          error: 'Config name too long (max 200 characters)' 
        });
      }
    }
    
    if (req.body.value && typeof req.body.value === 'string') {
      if (req.body.value.length > 5000) {
        return res.status(400).json({ 
          error: 'Config value too long (max 5000 characters)' 
        });
      }
    }
    
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
