import { Router, Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// GET all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { activitySector, active } = req.query;
    const filter: any = {};

    if (activitySector) {
      filter.activitySector = activitySector;
    }
    if (active !== undefined) {
      const activeStr = String(active).toLowerCase();
      filter.active = activeStr === 'true' || activeStr === '1';
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// GET product by slug
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// GET single product by id or _id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ $or: [{ _id: id }, { id }] });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to fetch product' });
  }
});

// POST create product
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const productData = {
      ...req.body,
      id: req.body.id || 'p' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3),
      slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-3),
    };
    const product = new Product(productData);
    await product.save();
    res.status(201).json({ success: true, data: product.toObject() });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ success: false, message: 'Failed to create product', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PUT update product
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
    } else {
      res.json({ success: true, data: product });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ $or: [{ _id: id }, { id }] });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
    } else {
      res.json({ success: true, message: 'Product deleted' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete product' });
  }
});

export default router;
