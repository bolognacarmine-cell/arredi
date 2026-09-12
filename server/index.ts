import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import mediaRoutes from './routes/media.js';
import offerRoutes from './routes/offers.js';
import productRoutes from './routes/products.js';
import projectRoutes from './routes/projects.js';
import quoteRoutes from './routes/quotes.js';
import siteConfigRoutes from './routes/siteConfig.js';
import blogRoutes from './routes/blog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'server.env') });

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[SPA fallback] sendFile failed:', err.message)
      res.status(500).json({ error: 'SPA index.html missing. Run npm run build first.' })
    }
  })
})

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`📁 Serving static files from ${staticPath}`);
  });
});
