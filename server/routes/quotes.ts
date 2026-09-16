import { Router, Request, Response } from 'express';
import { Quote } from '../models/Quote.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { sendQuoteNotification } from '../utils/email.js';

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
    // Validate nome field (required)
    if (!req.body.nome || typeof req.body.nome !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome is required and must be a string' 
      });
    }
    
    if (req.body.nome.length > 200) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome too long (max 200 characters)' 
      });
    }
    
    // Validate cognome field (required)
    if (!req.body.cognome || typeof req.body.cognome !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cognome is required and must be a string' 
      });
    }
    
    if (req.body.cognome.length > 200) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cognome too long (max 200 characters)' 
      });
    }
    
    // Validate email field (required)
    if (!req.body.email || typeof req.body.email !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required and must be a string' 
      });
    }
    
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
    
    // Validate data field (required)
    if (!req.body.data || typeof req.body.data !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Data is required and must be a string' 
      });
    }
    
    // Validate optional fields with length limits
    if (req.body.azienda && typeof req.body.azienda === 'string') {
      if (req.body.azienda.length > 200) {
        return res.status(400).json({ 
          success: false, 
          message: 'Azienda too long (max 200 characters)' 
        });
      }
    }
    
    if (req.body.settore && typeof req.body.settore === 'string') {
      if (req.body.settore.length > 100) {
        return res.status(400).json({ 
          success: false, 
          message: 'Settore too long (max 100 characters)' 
        });
      }
    }
    
    if (req.body.telefono && typeof req.body.telefono === 'string') {
      if (req.body.telefono.length > 50) {
        return res.status(400).json({ 
          success: false, 
          message: 'Telefono too long (max 50 characters)' 
        });
      }
    }
    
    if (req.body.messaggio && typeof req.body.messaggio === 'string') {
      if (req.body.messaggio.length > 2000) {
        return res.status(400).json({ 
          success: false, 
          message: 'Messaggio too long (max 2000 characters)' 
        });
      }
    }
    
    if (req.body.note && typeof req.body.note === 'string') {
      if (req.body.note.length > 2000) {
        return res.status(400).json({ 
          success: false, 
          message: 'Note too long (max 2000 characters)' 
        });
      }
    }
    
    const quote = new Quote(req.body);
    await quote.save();
    
    // Email notifications: Send quote notification emails in background
    // This is non-blocking - quote is saved regardless of email success/failure
    // Email sending failures are logged but don't affect the user experience
    sendQuoteNotification({
      nome: req.body.nome,
      cognome: req.body.cognome,
      azienda: req.body.azienda,
      settore: req.body.settore,
      email: req.body.email,
      telefono: req.body.telefono,
      data: req.body.data,
      metratura: req.body.metratura,
      arredo: req.body.arredo,
      messaggio: req.body.messaggio,
      note: req.body.note
    }).then(emailResults => {
      if (emailResults.detailedEmailSent || emailResults.notificationEmailSent) {
        console.log('[Quotes] Quote notification emails sent successfully');
      } else {
        console.warn('[Quotes] Failed to send quote notification emails - SMTP configuration may be incomplete');
      }
    }).catch(emailError => {
      console.error('[Quotes] Error sending quote notification emails:', emailError);
    });
    
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
