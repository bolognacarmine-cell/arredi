import { Router, Request, Response } from 'express';
import { SiteConfig } from '../models/SiteConfig.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { sendEmail } from '../utils/email.js';

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
    // Security: Mask sensitive values (passwords) before sending to client
    const maskedConfigs = configs.map(config => {
      if (config.isSensitive) {
        return {
          ...config.toObject(),
          value: '***MASKED***' // Don't send actual sensitive values to frontend
        };
      }
      return config;
    });
    res.json(maskedConfigs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site config' });
  }
});

// GET SMTP configuration specifically (for admin panel)
router.get('/smtp', async (req: Request, res: Response) => {
  // Security: Ensure only GET method is accepted
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const configs = await SiteConfig.find({
      key: {
        $in: [
          'smtpHost',
          'smtpPort', 
          'smtpUsername',
          'smtpFrom',
          'smtpFromName',
          'quoteNotificationEmail'
        ]
      }
    });

    const configMap: Record<string, string> = {};
    configs.forEach(config => {
      // Security: Don't send password to frontend (write-only)
      // Also don't send smtpUsername as it's marked as sensitive
      if (config.key !== 'smtpPassword' && config.key !== 'smtpUsername') {
        configMap[config.key] = config.value;
      }
    });

    res.json(configMap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SMTP configuration' });
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
    if (req.body.key && typeof req.body.key === 'string') {
      if (req.body.key.length > 200) {
        return res.status(400).json({ 
          error: 'Config key too long (max 200 characters)' 
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
    
    // Mark sensitive keys as write-only
    const sensitiveKeys = ['smtpPassword', 'smtpUsername'];
    if (req.body.key && sensitiveKeys.includes(req.body.key)) {
      req.body.isSensitive = true;
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
    if (req.body.key && typeof req.body.key === 'string') {
      if (req.body.key.length > 200) {
        return res.status(400).json({ 
          error: 'Config key too long (max 200 characters)' 
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
    
    // Mark sensitive keys as write-only
    const sensitiveKeys = ['smtpPassword', 'smtpUsername'];
    if (req.body.key && sensitiveKeys.includes(req.body.key)) {
      req.body.isSensitive = true;
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

// POST save SMTP configuration (convenience endpoint)
router.post('/smtp', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only POST method is accepted
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const {
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpFrom,
      smtpFromName,
      quoteNotificationEmail
    } = req.body;

    // Validate required fields with specific error messages
    const missingFields: string[] = [];
    
    if (!smtpHost || typeof smtpHost !== 'string' || smtpHost.trim() === '') {
      missingFields.push('smtpHost');
    }
    if (!smtpPort || smtpPort === '' || smtpPort === 0) {
      missingFields.push('smtpPort');
    }
    if (!smtpUsername || typeof smtpUsername !== 'string' || smtpUsername.trim() === '') {
      missingFields.push('smtpUsername');
    }
    if (!smtpPassword || typeof smtpPassword !== 'string' || smtpPassword.trim() === '') {
      missingFields.push('smtpPassword');
    }
    if (!smtpFrom || typeof smtpFrom !== 'string' || smtpFrom.trim() === '') {
      missingFields.push('smtpFrom');
    }
    if (!smtpFromName || typeof smtpFromName !== 'string' || smtpFromName.trim() === '') {
      missingFields.push('smtpFromName');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required SMTP configuration fields: ${missingFields.join(', ')}` 
      });
    }

    // Update or create each configuration
    const smtpConfigs = [
      { key: 'smtpHost', value: smtpHost.trim(), description: 'SMTP server host', isSensitive: false },
      { key: 'smtpPort', value: String(smtpPort).trim(), description: 'SMTP server port', isSensitive: false },
      { key: 'smtpUsername', value: smtpUsername.trim(), description: 'SMTP username', isSensitive: true },
      { key: 'smtpPassword', value: smtpPassword.trim(), description: 'SMTP password', isSensitive: true },
      { key: 'smtpFrom', value: smtpFrom.trim(), description: 'From email address', isSensitive: false },
      { key: 'smtpFromName', value: smtpFromName.trim(), description: 'From name', isSensitive: false },
    ];

    if (quoteNotificationEmail && typeof quoteNotificationEmail === 'string' && quoteNotificationEmail.trim() !== '') {
      smtpConfigs.push({ 
        key: 'quoteNotificationEmail', 
        value: quoteNotificationEmail.trim(), 
        description: 'Email for quote notifications', 
        isSensitive: false 
      });
    }

    // Use bulk operation with upsert
    for (const config of smtpConfigs) {
      await SiteConfig.findOneAndUpdate(
        { key: config.key },
        { 
          key: config.key, 
          value: config.value, 
          description: config.description,
          isSensitive: config.isSensitive,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: 'SMTP configuration saved successfully' });
  } catch (error) {
    console.error('Error saving SMTP configuration:', error);
    res.status(400).json({ error: 'Failed to save SMTP configuration' });
  }
});

// POST send test email
router.post('/test-email', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only POST method is accepted
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }
  
  try {
    // Load current SMTP configuration - check all required fields
    const configs = await SiteConfig.find({
      key: {
        $in: [
          'smtpHost',
          'smtpPort',
          'smtpUsername',
          'smtpPassword',
          'smtpFrom',
          'smtpFromName'
        ]
      }
    });

    const configMap = new Map<string, string>();
    configs.forEach(config => {
      configMap.set(config.key, config.value);
    });

    const smtpHost = configMap.get('smtpHost');
    const smtpPort = configMap.get('smtpPort');
    const smtpUsername = configMap.get('smtpUsername');
    const smtpPassword = configMap.get('smtpPassword');
    const smtpFrom = configMap.get('smtpFrom');
    const smtpFromName = configMap.get('smtpFromName');

    // Verify all required fields are present
    const missingFields: string[] = [];
    if (!smtpHost) missingFields.push('Host SMTP');
    if (!smtpPort) missingFields.push('Porta');
    if (!smtpUsername) missingFields.push('Username');
    if (!smtpPassword) missingFields.push('Password');
    if (!smtpFrom) missingFields.push('Email mittente');
    if (!smtpFromName) missingFields.push('Nome mittente');

    if (missingFields.length > 0) {
      console.error('[Test Email] Missing SMTP configuration fields:', missingFields);
      return res.status(400).json({ 
        error: `Configurazione SMTP incompleta: mancano i campi ${missingFields.join(', ')}` 
      });
    }

    console.log('[Test Email] Sending test email to:', smtpFrom);
    console.log('[Test Email] Using SMTP host:', smtpHost, 'port:', smtpPort);

    // Send test email to the configured from address
    const result = await sendEmail({
      to: smtpFrom,
      subject: 'Test email from Farcom Arredi',
      text: 'This is a test email from the Farcom Arredi website. Your SMTP configuration is working correctly.',
      html: '<p>This is a test email from the Farcom Arredi website. Your SMTP configuration is working correctly.</p>'
    });

    if (result.success) {
      console.log('[Test Email] Test email sent successfully');
      res.json({ success: true, message: 'Test email sent successfully' });
    } else {
      console.error('[Test Email] Failed to send test email:', result.error);
      // Always return the specific error from sendEmail, never fall back to generic message
      const errorMessage = result.error || 'Errore nell\'invio dell\'email di test';
      res.status(500).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('[Test Email] Unexpected error sending test email:', error);
    res.status(500).json({ error: 'Errore imprevisto nell\'invio dell\'email di test' });
  }
});

// GET debug SMTP configuration (admin only, for troubleshooting)
router.get('/smtp/debug', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only GET method is accepted
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const configs = await SiteConfig.find({
      key: {
        $in: [
          'smtpHost',
          'smtpPort',
          'smtpUsername',
          'smtpFrom',
          'smtpFromName',
          'quoteNotificationEmail'
        ]
      }
    });

    const configMap: Record<string, any> = {};
    configs.forEach(config => {
      // Security: Never send password to frontend
      if (config.key !== 'smtpPassword') {
        configMap[config.key] = {
          value: config.value,
          configured: !!config.value && config.value.trim() !== '',
          description: config.description
        };
      }
    });

    // Add password status (without the actual value)
    const passwordConfig = configs.find(c => c.key === 'smtpPassword');
    configMap['smtpPassword'] = {
      configured: !!passwordConfig && !!passwordConfig.value && passwordConfig.value.trim() !== '',
      description: 'SMTP password (write-only, never shown)'
    };

    res.json({
      configuration: configMap,
      complete: Object.values(configMap).every((field: any) => field.configured),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Debug] Error fetching SMTP configuration:', error);
    res.status(500).json({ error: 'Failed to fetch SMTP configuration for debugging' });
  }
});

export default router;
