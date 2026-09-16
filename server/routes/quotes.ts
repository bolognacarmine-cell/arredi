import { Router, Request, Response } from 'express';
import { Quote } from '../models/Quote.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// GET all quotes
router.get('/', async (req: Request, res: Response) => {
  // Security: Ensure only GET method is accepted
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quotes' });
  }
});

// POST create quote (public endpoint for form submissions)
router.post('/', async (req: Request, res: Response) => {
  // Security: Ensure only POST method is accepted
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
  try {
    // Security: Basic input validation for public endpoint
    // Validate name field if present
    if (req.body.name && typeof req.body.name === 'string') {
      if (req.body.name.length > 200) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name too long (max 200 characters)' 
        });
      }
    }
    
    // Validate email field if present
    if (req.body.email && typeof req.body.email === 'string') {
      if (req.body.email.length > 254) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email too long (max 254 characters)' 
        });
      }
      // Basic email format validation
      if (!req.body.email.includes('@') || req.body.email.length < 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format' 
        });
      }
    }
    
    // Validate message field if present
    if (req.body.message && typeof req.body.message === 'string') {
      if (req.body.message.length > 2000) {
        return res.status(400).json({ 
          success: false, 
          message: 'Message too long (max 2000 characters)' 
        });
      }
    }
    
    // Validate phone field if present
    if (req.body.phone && typeof req.body.phone === 'string') {
      if (req.body.phone.length > 50) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number too long (max 50 characters)' 
        });
      }
    }
    
    const quote = new Quote(req.body);
    await quote.save();
    res.status(201).json({ success: true, data: quote });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create quote' });
  }
});

// PUT update quote
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only PUT method is accepted
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
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
  // Security: Ensure only PATCH method is accepted
  if (req.method !== 'PATCH') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
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
  // Security: Ensure only DELETE method is accepted
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
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
