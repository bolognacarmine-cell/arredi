import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// Helper function to check if user is admin
function isAdmin(req: Request): boolean {
  return !!(req.session?.userId && req.session?.userRole === 'admin');
}

// Helper function to apply public product filters
// Public routes must always require active: true
// Sold products with active=true are shown with VENDUTO badge
// Sold products with active=false are hidden regardless of isSold status
function applyPublicFilters(filter: any, userIsAdmin: boolean): void {
  if (!userIsAdmin) {
    // Public routes must always require active: true
    filter.active = true;
    // isSold does not affect visibility for public routes
    // Sold status only controls badge display in frontend
  }
  // Admin users can see all products regardless of active or sold status
}

// Gli id applicativi (es. "p8xtyb21tj") non sono ObjectId: includerli nel ramo
// _id farebbe fallire la query con un CastError.
const byId = (id: string) =>
  mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { id }] } : { id };

const errMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

// GET all products
router.get('/', async (req: Request, res: Response) => {
  try {
    // Security: Ensure only GET method is accepted
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }
    const { activitySector, active } = req.query;
    const filter: any = {};

    if (activitySector) {
      filter.activitySector = activitySector;
    }

    // Security: Handle sold products filter based on authentication
    const userIsAdmin = isAdmin(req);

    // Apply public filters for non-admin users
    applyPublicFilters(filter, userIsAdmin);

    // Admin users: respect active query parameter if provided
    if (userIsAdmin && active !== undefined) {
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
    // Security: Ensure only GET method is accepted
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }
    const { slug } = req.params;
    const filter: any = { slug };

    // Security: Handle sold products filter based on authentication
    const userIsAdmin = isAdmin(req);

    // Apply public filters for non-admin users
    applyPublicFilters(filter, userIsAdmin);

    const product = await Product.findOne(filter);
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
    const baseFilter = byId(id);

    // Security: Handle sold products filter based on authentication and configuration
    const userIsAdmin = isAdmin(req);

    // Apply public filters for non-admin users
    await applyPublicFilters(baseFilter, userIsAdmin);

    const product = await Product.findOne(baseFilter);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    // Security: Mask detailed error messages from client - only generic message
    res.status(400).json({ success: false, message: 'Failed to fetch product' });
  }
});

// POST create product
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Security: Ensure only POST method is accepted
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }
    
    // Minimal input validation - ensure required fields exist and are strings
    if (!req.body.name || typeof req.body.name !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Product name is required and must be a string' 
      });
    }
    
    // Product name length validation (reasonable limits for UX and security)
    if (req.body.name.length > 200) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product name too long (max 200 characters)' 
      });
    }
    
    // Description length validation (if present)
    if (req.body.description && typeof req.body.description === 'string') {
      if (req.body.description.length > 2000) {
        return res.status(400).json({ 
          success: false, 
          message: 'Description too long (max 2000 characters)' 
        });
      }
    }
    
    // Price validation (if present and numeric)
    if (req.body.price !== undefined) {
      const price = Number(req.body.price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Price must be a non-negative number' 
        });
      }
    }
    
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
    // Security: Mask detailed error messages from client - only generic message
    res.status(400).json({ success: false, message: 'Failed to create product' });
  }
});

// PUT update product
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Security: Ensure only PUT method is accepted
    if (req.method !== 'PUT') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }
    
    const { id } = req.params;
    
    // Minimal validation - ensure id parameter exists
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid product ID is required' 
      });
    }
    const { _id, id: _ignoredId, createdAt, ...update } = req.body;
    const product = await Product.findOneAndUpdate(
      byId(id),
      { ...update, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
    } else {
      res.json({ success: true, data: product });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    // Security: Mask detailed error messages from client - only generic message
    res.status(400).json({ success: false, message: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Security: Ensure only DELETE method is accepted
    if (req.method !== 'DELETE') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }
    
    const { id } = req.params;
    
    // Minimal validation - ensure id parameter exists
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid product ID is required' 
      });
    }
    const product = await Product.findOneAndDelete(byId(id));
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
    } else {
      res.json({ success: true, message: 'Product deleted' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    // Security: Mask detailed error messages from client - only generic message
    res.status(400).json({ success: false, message: 'Failed to delete product' });
  }
});

export default router;
