import { Router, Request, Response } from 'express';
import { Quote } from '../models/Quote.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { sendQuoteNotification } from '../utils/email.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Cloudinary] Configured successfully');
} else {
  console.warn('[Cloudinary] Missing configuration:', {
    cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: !!process.env.CLOUDINARY_API_KEY,
    apiSecret: !!process.env.CLOUDINARY_API_SECRET
  });
}

// Debug endpoint to check Cloudinary configuration status (admin only)
router.get('/debug/cloudinary-status', requireAdmin, (req: Request, res: Response) => {
  const isConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    cloudinaryConfigured: isConfigured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'missing',
    apiKey: process.env.CLOUDINARY_API_KEY ? 'configured' : 'missing',
    apiSecret: process.env.CLOUDINARY_API_SECRET ? 'configured' : 'missing',
    note: isConfigured
      ? 'Cloudinary is configured - image upload should work'
      : 'Cloudinary is NOT configured - images will not be uploaded. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to environment variables.'
  });
});

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB per file
    files: 6, // Max 6 files
  },
});

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
    console.log('[Quotes] Fetched quotes:', quotes.length);
    quotes.forEach((quote: any) => {
      if (quote.attachments && quote.attachments.length > 0) {
        console.log(`[Quotes] Quote ${quote._id} has ${quote.attachments.length} attachments`);
      }
    });
    res.json({ success: true, data: quotes });
  } catch (error) {
    console.error('[Quotes] Error fetching quotes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quotes' });
  }
});

// POST create quote (public endpoint for form submissions)
router.post('/', upload.array('attachments', 6), async (req: Request, res: Response) => {
  // Security: Ensure only POST method is accepted
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const uploadedAttachments: any[] = [];

    // Handle file uploads if present
    if (files && files.length > 0) {
      // Validate Cloudinary configuration
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.warn('[Quotes] Cloudinary not configured, skipping file upload but allowing quote submission');
        // Skip file upload but allow quote submission without attachments
        // This makes the system more robust - users can still submit quotes even if upload isn't configured
      } else {
        // Cloudinary is configured, proceed with upload

        // Validate file count
        if (files.length > 6) {
          return res.status(400).json({
            success: false,
            message: 'Massimo 6 immagini per preventivo.'
          });
        }

        // Validate each file
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        for (const file of files) {
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({
              success: false,
              message: `Formato non supportato: ${file.originalname}. Usa JPEG, PNG o WebP.`
            });
          }

          if (file.size > 8 * 1024 * 1024) {
            return res.status(400).json({
              success: false,
              message: `File troppo grande: ${file.originalname}. Massimo 8MB per immagine.`
            });
          }

          if (file.size === 0) {
            return res.status(400).json({
              success: false,
              message: `File vuoto o corrotto: ${file.originalname}.`
            });
          }
        }

        // Upload files to Cloudinary
        for (const file of files) {
          try {
            const uploadResult = await cloudinary.uploader.upload(
              `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
              {
                folder: 'farcom-arredi/quotes',
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                transformation: [
                  { quality: 'auto:good' },
                  { fetch_format: 'auto' }
                ]
              }
            );

            uploadedAttachments.push({
              url: uploadResult.secure_url,
              secureUrl: uploadResult.secure_url,
              publicId: uploadResult.public_id,
              originalName: file.originalname,
              mimeType: file.mimetype,
              bytes: file.size,
              width: uploadResult.width,
              height: uploadResult.height,
            });
          } catch (uploadError) {
            console.error('[Cloudinary] Upload error for file:', file.originalname, uploadError);

            // Clean up already uploaded files on error
            for (const attachment of uploadedAttachments) {
              try {
                if (attachment.publicId) {
                  await cloudinary.uploader.destroy(attachment.publicId);
                }
              } catch (cleanupError) {
                console.error('[Cloudinary] Cleanup error:', cleanupError);
              }
            }

            return res.status(500).json({
              success: false,
              message: 'Errore durante il caricamento delle immagini. Riprova.'
            });
          }
        }
      }
    }

    // Extract form data from request body
    const quoteData = {
      nome: req.body.nome,
      cognome: req.body.cognome,
      azienda: req.body.azienda || '',
      settore: req.body.settore || '',
      email: req.body.email,
      telefono: req.body.telefono || '',
      data: req.body.data,
      stato: req.body.stato || 'nuovo',
      metratura: req.body.metratura || '',
      arredo: req.body.arredo || '',
      messaggio: req.body.messaggio || '',
      note: req.body.note || '',
      attachments: uploadedAttachments,
      createdAt: req.body.createdAt || new Date().toISOString(),
      updatedAt: req.body.updatedAt || new Date().toISOString(),
    };

    // Security: Basic input validation for public endpoint
    // Validate nome field (required)
    if (!quoteData.nome || typeof quoteData.nome !== 'string') {
      // Clean up uploaded files on validation error
      for (const attachment of uploadedAttachments) {
        try {
          if (attachment.publicId) {
            await cloudinary.uploader.destroy(attachment.publicId);
          }
        } catch (cleanupError) {
          console.error('[Cloudinary] Cleanup error:', cleanupError);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Nome is required and must be a string'
      });
    }

    if (quoteData.nome.length > 200) {
      // Clean up uploaded files on validation error
      for (const attachment of uploadedAttachments) {
        try {
          if (attachment.publicId) {
            await cloudinary.uploader.destroy(attachment.publicId);
          }
        } catch (cleanupError) {
          console.error('[Cloudinary] Cleanup error:', cleanupError);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Nome too long (max 200 characters)'
      });
    }

    // Validate cognome field (required)
    if (!quoteData.cognome || typeof quoteData.cognome !== 'string') {
      // Clean up uploaded files on validation error
      for (const attachment of uploadedAttachments) {
        try {
          if (attachment.publicId) {
            await cloudinary.uploader.destroy(attachment.publicId);
          }
        } catch (cleanupError) {
          console.error('[Cloudinary] Cleanup error:', cleanupError);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Cognome is required and must be a string'
      });
    }

    if (quoteData.cognome.length > 200) {
      // Clean up uploaded files on validation error
      for (const attachment of uploadedAttachments) {
        try {
          if (attachment.publicId) {
            await cloudinary.uploader.destroy(attachment.publicId);
          }
        } catch (cleanupError) {
          console.error('[Cloudinary] Cleanup error:', cleanupError);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Cognome too long (max 200 characters)'
      });
    }

    // Validate email field (required)
    if (!quoteData.email || typeof quoteData.email !== 'string') {
      // Clean up uploaded files on validation error
      for (const attachment of uploadedAttachments) {
        try {
          if (attachment.publicId) {
            await cloudinary.uploader.destroy(attachment.publicId);
          }
        } catch (cleanupError) {
          console.error('[Cloudinary] Cleanup error:', cleanupError);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Email is required and must be a string'
      });
    }

    if (quoteData.email.length > 254) {
      // Clean up uploaded files on validation error
      for (const attachment of uploadedAttachments) {
        try {
          if (attachment.publicId) {
            await cloudinary.uploader.destroy(attachment.publicId);
          }
        } catch (cleanupError) {
          console.error('[Cloudinary] Cleanup error:', cleanupError);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Email too long (max 254 characters)'
      });
    }

    // Basic email format validation
    if (!quoteData.email.includes('@') || quoteData.email.length < 5) {
      // Clean up uploaded files on validation error
      for (const attachment of uploadedAttachments) {
        try {
          if (attachment.publicId) {
            await cloudinary.uploader.destroy(attachment.publicId);
          }
        } catch (cleanupError) {
          console.error('[Cloudinary] Cleanup error:', cleanupError);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate data field (required)
    if (!quoteData.data || typeof quoteData.data !== 'string') {
      // Clean up uploaded files on validation error
      for (const attachment of uploadedAttachments) {
        try {
          if (attachment.publicId) {
            await cloudinary.uploader.destroy(attachment.publicId);
          }
        } catch (cleanupError) {
          console.error('[Cloudinary] Cleanup error:', cleanupError);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Data is required and must be a string'
      });
    }

    // Validate optional fields with length limits
    if (quoteData.azienda && typeof quoteData.azienda === 'string') {
      if (quoteData.azienda.length > 200) {
        return res.status(400).json({
          success: false,
          message: 'Azienda too long (max 200 characters)'
        });
      }
    }

    if (quoteData.settore && typeof quoteData.settore === 'string') {
      if (quoteData.settore.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Settore too long (max 100 characters)'
        });
      }
    }

    if (quoteData.telefono && typeof quoteData.telefono === 'string') {
      if (quoteData.telefono.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Telefono too long (max 50 characters)'
        });
      }
    }

    if (quoteData.messaggio && typeof quoteData.messaggio === 'string') {
      if (quoteData.messaggio.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Messaggio too long (max 2000 characters)'
        });
      }
    }

    if (quoteData.note && typeof quoteData.note === 'string') {
      if (quoteData.note.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Note too long (max 2000 characters)'
        });
      }
    }

    const quote = new Quote(quoteData);
    await quote.save();

    // Email notifications: Send quote notification emails in background
    // This is non-blocking - quote is saved regardless of email success/failure
    // Email sending failures are logged but don't affect the user experience
    sendQuoteNotification({
      nome: quoteData.nome,
      cognome: quoteData.cognome,
      azienda: quoteData.azienda,
      settore: quoteData.settore,
      email: quoteData.email,
      telefono: quoteData.telefono,
      data: quoteData.data,
      metratura: quoteData.metratura,
      arredo: quoteData.arredo,
      messaggio: quoteData.messaggio,
      note: quoteData.note
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
    console.error('[Quotes] Error creating quote:', error);
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
    
    // Get existing quote to preserve tracking fields
    const existingQuote = await Quote.findById(id);
    if (!existingQuote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    // Protect tracking fields from accidental overwrite
    // Only allow explicit updates if they are provided in the request
    const updateData = { ...req.body };
    
    // Preserve statusHistory and notes unless explicitly provided
    if (!updateData.statusHistory) {
      updateData.statusHistory = existingQuote.statusHistory;
    }
    if (!updateData.notes) {
      updateData.notes = existingQuote.notes;
    }
    
    // Preserve updatedAt timestamp
    updateData.updatedAt = new Date();

    const quote = await Quote.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, data: quote });
  } catch (error) {
    console.error('[Quotes] Error updating quote:', error);
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
    const { stato, note } = req.body;

    if (!stato || !['nuovo', 'contattato', 'chiuso'].includes(stato)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    const previousStatus = quote.stato;
    const changedBy = req.session?.userId || 'system';

    // Add status history entry
    const statusHistoryEntry = {
      previousStatus,
      newStatus: stato,
      timestamp: new Date(),
      changedBy,
      note: note || undefined,
    };

    quote.statusHistory.push(statusHistoryEntry);
    quote.stato = stato;
    quote.updatedAt = new Date();

    await quote.save();

    res.json({ success: true, data: quote });
  } catch (error) {
    console.error('[Quotes] Error updating quote status:', error);
    res.status(400).json({ success: false, message: 'Failed to update quote status' });
  }
});

// POST add note to quote
router.post('/:id/notes', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only POST method is accepted
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { id } = req.params;
    const { text } = req.body;

    // Validate note text
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required and cannot be empty'
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Note text too long (max 2000 characters)'
      });
    }

    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    const author = req.session?.userId || 'system';

    // Add new note to notes array
    const newNote = {
      text: text.trim(),
      author,
      timestamp: new Date(),
    };

    quote.notes.push(newNote);
    quote.updatedAt = new Date();

    await quote.save();

    res.json({ success: true, data: quote });
  } catch (error) {
    console.error('[Quotes] Error adding note to quote:', error);
    res.status(400).json({ success: false, message: 'Failed to add note to quote' });
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
