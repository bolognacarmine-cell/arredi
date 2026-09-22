import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables BEFORE importing other modules
dotenv.config({ path: path.resolve(__dirname, '../.server.env') });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { migrateOffersToProducts } from './migrateOffersToProducts.js';
import mediaRoutes from './routes/media.js';
import productRoutes from './routes/products.js';
import projectRoutes from './routes/projects.js';
import quoteRoutes from './routes/quotes.js';
import siteConfigRoutes from './routes/siteConfig.js';
import blogRoutes from './routes/blog.js';
import adminRoutes from './routes/admin.js';
import { adminApiRateLimiter } from './middleware/rateLimiter.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    if (dbStatus === 'disconnected') {
      health.status = 'degraded';
      return res.status(503).json(health);
    }

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Trust proxy for Render and other reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow same-origin and any origin in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // In production, allow same-origin requests (no origin header for same-origin)
    // and specific allowed origins for cross-origin if needed
    const allowedOrigins = [
      'https://arredi.onrender.com',
      'https://arredi.vercel.app',
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers - conservative, non-blocking implementation
// These headers add defense-in-depth without changing application behavior
app.use((req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking - allow same-origin only (permissive but safe)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // XSS protection (legacy but still useful for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy - disable unused features for security hardening
  // This is non-blocking as the app doesn't use these features
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=()');
  
  // Content Security Policy - organized and explicit permissive implementation
  // Designed to NOT block existing functionality while providing a base for future tightening
  // Note: 'unsafe-inline' and 'unsafe-eval' are allowed to ensure React/Vite and inline scripts work
  // Future improvement: tighten CSP by removing unsafe-inline once all scripts are externalized
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "img-src 'self' data: blob: https:; " +
    "connect-src 'self' https:; " +
    "font-src 'self' data: https:; " +
    "media-src 'self' data: blob: https:; " +
    "frame-src 'self' https:; " +
    "frame-ancestors 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  
  next();
});

// Session configuration
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable is not defined');
}

// Le sessioni vivono su MongoDB: con lo store in memoria ogni riavvio o sleep
// dell'istanza invalidava il login admin e le API rispondevano 401.
const sessionStore = process.env.MONGODB_URI
  ? MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60,
      touchAfter: 3600,
    })
  : undefined;

if (!sessionStore) {
  console.warn('⚠️  MONGODB_URI mancante: sessioni in memoria, il login admin non sopravvive ai riavvii');
}

app.use(session({
  store: sessionStore,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  },
  name: 'farcom.sid',
}));

// Serve static files from dist/ (parent directory of server/dist)
const staticPath = path.resolve(__dirname, '../../dist');
app.use(express.static(staticPath));

// API Routes
app.use('/api/media', mediaRoutes);
app.use('/api/products', productRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/blog', blogRoutes);
// @ts-ignore - TypeScript version conflict between project and server folder
app.use('/api/admin', adminApiRateLimiter as any, adminRoutes);

// Retrocompatibilità: endpoint Vite dev /__admin/projects in produzione
// Esegue lo stesso salvataggio batch ma su MongoDB invece di src/data.ts
(async () => {
  try {
    const mod = await import('./routes/projects.js') as any;
    const handler: any = mod?.handleBatchReplace;
    if (typeof handler === 'function') {
      app.post('/__admin/projects', handler);
    }
  } catch (e) {
    console.warn('Impossibile montare /__admin/projects alias:', e);
  }
})();

// Serve index.html for all other non-API routes (SPA fallback)
// - DEVE essere dopo /api/* e gli static assets, altrimenti intercetta le chiamate API
// - Usa middleware invece di wildcard route per compatibilità con path-to-regexp
app.use((req: Request, res: Response, next: NextFunction) => {
  const accept = req.headers.accept || ''
  const url = req.originalUrl || req.url || '/'
  const hasExt = /\.[a-zA-Z0-9]{1,10}(?:\?|#|$)/.test(url)

  if (
    req.method !== 'GET' ||
    url.startsWith('/api/') ||
    url.startsWith('/__admin') ||
    url.startsWith('/.well-known') ||
    url.startsWith('/assets/') ||
    url.startsWith('/videos/') ||
    url.startsWith('/images/') ||
    (hasExt && !url.endsWith('.html'))
  ) {
    return next()
  }

  if (!accept.includes('text/html') && !accept.includes('*/*') && accept.length > 0) {
    return next()
  }

  const indexPath = path.resolve(__dirname, '../../dist/index.html')
  res.sendFile(indexPath, (err: Error | null) => {
    if (err) {
      console.error('[SPA fallback] sendFile failed:', err.message)
      res.status(500).json({ error: 'SPA index.html missing. Run npm run build first.' })
    }
  })
})

// Body parser errors (payload troppo grande, JSON malformato) devono tornare JSON:
// il client fa response.json() e con l'HTML di default fallisce con un errore opaco.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload troppo grande: carica le immagini come URL invece che in base64.',
    });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'JSON della richiesta non valido' });
  }
  return next(err);
});

// Global error handler - masks sensitive details from client responses
// Logs full error details server-side but returns generic messages to client
// This prevents information leakage (stack traces, DB queries, file paths, etc.)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Log full error details server-side for debugging
  console.error('[Error Handler]', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Return generic error message to client - never expose stack traces or internal details
  // Keep existing error messages for known client-facing errors
  const isKnownError = err?.message && (
    err.message.includes('Payload troppo grande') ||
    err.message.includes('JSON della richiesta non valido') ||
    err.message.includes('Unauthorized') ||
    err.message.includes('Non autorizzato')
  );
  
  if (isKnownError) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
  
  // Generic error for unknown issues - prevents information leakage
  res.status(err.status || 500).json({
    success: false,
    message: 'Errore del server. Riprova più tardi.'
  });
});

// Start server after DB connection
connectDB().then(async () => {
  try {
    await migrateOffersToProducts();
  } catch (error) {
    console.error('Migrazione offerte non riuscita:', error);
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`📁 Serving static files from ${staticPath}`);
  });
});
