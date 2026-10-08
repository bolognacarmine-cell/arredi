import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, parse as parseUrl } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables BEFORE importing other modules
// Prefer root `.server.env`, fallback to `server/server.env` (legacy local path).
const envCandidates = [
  path.resolve(__dirname, '../.server.env'),
  path.resolve(__dirname, './server.env'),
]
for (const envPath of envCandidates) {
  const result = dotenv.config({ path: envPath })
  if (!result.error) {
    console.log(`[env] Loaded ${envPath}`)
    break
  }
}
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

// 🛡️ GUARDIA /api LIVELLO 1 — PRIMA DI TUTTO (dopo /health).
// NON consuma la risposta: marca soltanto che si tratta di una richiesta API
// e garantisce che nessun middleware successivo (CORS, static, session) la
// possa trasformare in HTML. Le rotte /api/* vere (montate dopo) continuano
// a funzionare normalmente con next().
//
// Contemporaneamente wrappa express.static in basso per salvare le API da
// qualunque file statico omonimo in dist/ (es. dist/api/admin/index.html).
app.use((req: Request, res: Response, next: NextFunction) => {
  const rawUrl = req.originalUrl || req.url || '/'
  let pathname = '/'
  try { pathname = (parseUrl(rawUrl).pathname as string) || '/' } catch { pathname = rawUrl.split('?')[0].split('#')[0] || '/' }
  try { pathname = decodeURI(pathname) || '/' } catch { /* keep raw */ }
  pathname = pathname.trim() || '/'
  const nativePath = (req.path as string).trim() || '/'

  const looksLikeApi =
    pathname.startsWith('/api/') || pathname === '/api' ||
    nativePath.startsWith('/api/') || nativePath === '/api' ||
    pathname.toLowerCase().startsWith('/api/') ||
    nativePath.toLowerCase().startsWith('/api/')

  if (looksLikeApi) {
    (res as Response & { locals: Record<string, unknown> }).locals.isApiRequest = true
  }
  next()
});

// Trust proxy for Render and other reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, same-origin fetch, <form> GETs)
    if (!origin) return callback(null, true);
    // Allow any origin in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // In production: whitelist + fallback a true per origini Render di rolling-deploy
    // (se scartassimo con Error la preflight OPTIONS fallirebbe con 500 e CORS broken).
    // L'autenticazione server-side (session) protegge comunque gli endpoint.
    const allowedOrigins = [
      'https://arredi.onrender.com',
      'https://arredi.vercel.app',
    ];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (origin.endsWith('.onrender.com')) {
      console.warn('[CORS] Allowlisted rolling deploy origin:', origin);
      return callback(null, true);
    }
    console.warn('[CORS] Origin non whitelistata (allow anyway):', origin);
    return callback(null, true);
  },
  credentials: true,
  exposedHeaders: ['Set-Cookie'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Cookie'],
  maxAge: 86400,
}));

// Assicura che le richieste OPTIONS tornino sempre 204 — alcuni browser falliscono
// se preflight CORS arriva a un handler che restituisce 500/404.
app.options('*', (_req: Request, res: Response) => {
  res.status(204).send();
});
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

const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  store: sessionStore,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 giorni
    path: '/',
    domain: undefined,
  },
  name: 'farcom.sid',
  rolling: true,
}));

// Serve static files from dist/ (parent directory of server/dist).
// WRAPPER: salta express.static per le richieste marcate come API
// (GUARDIA LIVELLO 1 — res.locals.isApiRequest). Anche se per assurdo
// qualcuno crea un file dist/api/admin/index.html, non verrà MAI servito
// su /api/admin/me — la richiesta passa oltre e arriva alla guardia L2/L3.
const staticPath = path.resolve(__dirname, '../../dist');
const staticMiddleware = express.static(staticPath);
app.use((req: Request, res: Response, next: NextFunction) => {
  if ((res as Response & { locals: Record<string, unknown> }).locals.isApiRequest) {
    return next()
  }
  return staticMiddleware(req, res, next)
});

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
// NOTA: Questa route legacy è disabilitata in produzione - usa /api/projects/batch invece
if (process.env.NODE_ENV !== 'production') {
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
}

// ⚠️ SALVAGUARDIA CRITICA /api/* (defense-in-depth):
// Qualsiasi richiesta il cui path inizi per /api/ E CHE ARRIVA QUI
// (quindi nessuna route delle API montate sopra ha matchato)
// DEVE SEMPRE rispondere JSON. Non può MAI finire nel fallback SPA che
// servirebbe index.html → React mount → loop infinito / React error #300
// quando l'utente scrive a mano endpoint tipo /api/admin/me nella URL bar.
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint non trovato',
    error: {
      code: 'API_ENDPOINT_NOT_FOUND',
      path: _req.path,
      method: _req.method,
    }
  });
});

// Serve index.html for all other non-API routes (SPA fallback)
// - DEVE essere dopo /api/* e gli static assets, altrimenti intercetta le chiamate API
// - Usa middleware invece di wildcard route per compatibilità con path-to-regexp
// - Usa parseUrl da import top-level ESM (NON require('url'), che non esiste in ESM)
// - Controlla che index.html esista davvero per evitare 500 brutti
const DIST_DIR = path.resolve(__dirname, '../../dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
let indexHtmlExists = false;
try {
  indexHtmlExists = fs.existsSync(INDEX_HTML_PATH);
  console.log('[SPA fallback] index.html trovato in:', INDEX_HTML_PATH, indexHtmlExists ? 'OK' : 'NOT FOUND');
} catch (e) {
  console.warn('[SPA fallback] Impossibile verificare esistenza index.html:', e);
  indexHtmlExists = false;
}
app.use((req: Request, res: Response, next: NextFunction) => {
  const accept = req.headers.accept || ''
  const rawUrl = req.originalUrl || req.url || '/'

  // DIFESA 1: pathname pulito — proviamo 3 strategie in ordine di robustezza.
  // Se una fallisce, usiamo la fallback (split semplice). Alla fine trim + decode.
  let pathname = '/'
  try {
    pathname = (parseUrl(rawUrl).pathname as string) || '/'
  } catch (e) {
    pathname = rawUrl.split('?')[0].split('#')[0] || '/'
  }
  try {
    pathname = decodeURI(pathname) || '/'
  } catch {
    /* pathname con URI non valido — tieni versione raw */
  }
  pathname = pathname.trim() || '/'
  // req.path nativo Express come ulteriore fallback (senza query / hash)
  const nativePath = (req.path as string).trim() || '/'

  const hasExt = /\.[a-zA-Z0-9]{1,10}(?:\?|#|$)/.test(rawUrl)

  // DIFESA 2: skip /api/* — DOPPIA guardia (pathname e nativePath) +
  // versione lowercase senza //. Se anche UNA delle due matcha salta.
  // (Anche se c'è la barriera sopra app.use('/api', ...) che risponde 404 JSON,
  // manteniamo questo check per robustness in caso di refactoring ordine middleware futuri.)
  const looksLikeApi =
    pathname.startsWith('/api/') || pathname === '/api' ||
    nativePath.startsWith('/api/') || nativePath === '/api' ||
    pathname.toLowerCase().startsWith('/api/') ||
    nativePath.toLowerCase().startsWith('/api/')

  if (
    req.method !== 'GET' ||
    looksLikeApi ||
    pathname.startsWith('/__admin') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/videos/') ||
    pathname.startsWith('/images/') ||
    (hasExt && !pathname.endsWith('.html'))
  ) {
    return next()
  }

  if (!accept.includes('text/html') && !accept.includes('*/*') && accept.length > 0) {
    return next()
  }

  if (!indexHtmlExists) {
    console.error('[SPA fallback] index.html NON ESISTE in:', INDEX_HTML_PATH)
    return res.status(503).send(
      '<!doctype html><title>Build mancante</title>' +
      '<h1>503 — Build frontend non disponibile</h1>' +
      '<p>Esegui <code>npm run build</code> per generare la cartella <code>dist/</code>.</p>'
    );
  }

  res.sendFile(INDEX_HTML_PATH, {
    maxAge: 0,              // index.html non va mai cachato dai browser
    cacheControl: true,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  }, (err: Error | null) => {
    if (err) {
      console.error('[SPA fallback] sendFile failed:', err.message, INDEX_HTML_PATH)
      // Fallback ancora più robusto: se sendFile fallisce, prova fs.readFile
      try {
        const html = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
        res.status(200).type('html').send(html);
      } catch (readErr: any) {
        console.error('[SPA fallback] Anche fs.readFile fallito:', readErr?.message)
        res.status(500).json({ error: 'Errore interno nel caricamento della SPA.' })
      }
    }
  })
})

// 🛡️ GUARDIA /api LIVELLO 3 — ULTIMA CHANCE, DOPO SPA FALLBACK.
// Se anche L1 (marcatore) + L2 (dopo rotte API) + gli skip interni del
// fallback SPA non sono stati sufficienti — o un errore ha fatto next() —
// e la richiesta è ancora in sospeso MARCATA come API, questa barriera
// risponde incondizionatamente 404 JSON. È l'ultimo muro PRIMA degli
// error handler globali. Nessuna possibilità di HTML qui.
app.use((req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next()
  const isApi = (res as Response & { locals: Record<string, unknown> }).locals.isApiRequest === true
  if (!isApi) return next()
  const nativePath = (req.path as string).trim() || '/'
  return res.status(404).json({
    success: false,
    message: 'API endpoint non trovato',
    error: {
      code: 'API_ENDPOINT_NOT_FOUND',
      path: nativePath,
      method: req.method,
    }
  });
});

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
