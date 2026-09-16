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
import { connectDB } from './db.js';
import mediaRoutes from './routes/media.js';
import offerRoutes from './routes/offers.js';
import productRoutes from './routes/products.js';
import projectRoutes from './routes/projects.js';
import quoteRoutes from './routes/quotes.js';
import siteConfigRoutes from './routes/siteConfig.js';
import blogRoutes from './routes/blog.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3002;

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
    sameSite: 'lax', // Use 'lax' for same-origin, 'none' only for cross-origin
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
app.use('/api/offers', offerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);

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

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`📁 Serving static files from ${staticPath}`);
  });
});
