import express from 'express';
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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

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

// Serve index.html for all other routes (SPA) - Express 5 syntax
app.get('{/:path}', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../dist/index.html'));
});

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`📁 Serving static files from ${staticPath}`);
  });
});
