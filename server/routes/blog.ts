import { Router, Request, Response } from 'express';
import Post from '../models/Post.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

// @ts-ignore - MongoDB aggregation types are complex

const router = Router();

// GET all published posts with optional filters
router.get('/posts', async (req: Request, res: Response) => {
  // Security: Ensure only GET method is accepted
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { sectorSlug, page = '1', limit = '10' } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = { isPublished: true };
    if (sectorSlug) {
      query.sectorSlug = sectorSlug;
    }

    const posts = await Post.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

// GET single post by slug
router.get('/posts/:slug', async (req: Request, res: Response) => {
  // Security: Ensure only GET method is accepted
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug, isPublished: true });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch post' });
  }
});

// GET all sectors with post counts
router.get('/sectors', async (req: Request, res: Response) => {
  // Security: Ensure only GET method is accepted
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const sectors = await Post.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: '$sectorSlug',
          count: { $sum: 1 },
          latestPost: { $first: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          slug: '$_id',
          count: 1,
          title: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'salotto'] }, then: 'Salotto' },
                { case: { $eq: ['$_id', 'cucina'] }, then: 'Cucina' },
                { case: { $eq: ['$_id', 'camera-da-letto'] }, then: 'Camera da Letto' },
                { case: { $eq: ['$_id', 'bagno'] }, then: 'Bagno' },
                { case: { $eq: ['$_id', 'ufficio'] }, then: 'Ufficio' },
                { case: { $eq: ['$_id', 'esterno'] }, then: 'Esterno' },
                { case: { $eq: ['$_id', 'barbieri'] }, then: 'Barbieri' },
                { case: { $eq: ['$_id', 'negozi'] }, then: 'Negozi' },
                { case: { $eq: ['$_id', 'scuole'] }, then: 'Scuole' },
                { case: { $eq: ['$_id', 'bar'] }, then: 'Bar' },
                { case: { $eq: ['$_id', 'centri-estetici'] }, then: 'Centri Estetici' },
              ],
              default: { $concat: [
                { $toUpper: { $substr: ['$_id', 0, 1] } },
                { $substr: ['$_id', 1, 100] }
              ] },
            },
          },
          coverImage: '$latestPost.coverImage',
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data: sectors });
  } catch (error) {
    console.error('Error fetching sectors:', error);
    // Security: Mask detailed error messages from client - only generic message
    res.status(500).json({ success: false, error: 'Failed to fetch sectors' });
  }
});

// POST create new post (admin)
router.post('/posts', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only POST method is accepted
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
  
  try {
    // Security: Basic input validation
    if (!req.body.title || typeof req.body.title !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Post title is required and must be a string' 
      });
    }
    
    // Title length validation
    if (req.body.title.length > 300) {
      return res.status(400).json({ 
        success: false, 
        error: 'Post title too long (max 300 characters)' 
      });
    }
    
    // Content length validation (if present)
    if (req.body.content && typeof req.body.content === 'string') {
      if (req.body.content.length > 50000) {
        return res.status(400).json({ 
          success: false, 
          error: 'Post content too long (max 50000 characters)' 
        });
      }
    }
    
    // Excerpt length validation (if present)
    if (req.body.excerpt && typeof req.body.excerpt === 'string') {
      if (req.body.excerpt.length > 1000) {
        return res.status(400).json({ 
          success: false, 
          error: 'Post excerpt too long (max 1000 characters)' 
        });
      }
    }
    
    const post = new Post(req.body);
    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ success: false, error: 'Failed to create post' });
  }
});

// PUT update post (admin)
router.put('/posts/:id', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only PUT method is accepted
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { id } = req.params;
    
    // Security: Basic input validation
    if (req.body.title && typeof req.body.title === 'string') {
      if (req.body.title.length > 300) {
        return res.status(400).json({ 
          success: false, 
          error: 'Post title too long (max 300 characters)' 
        });
      }
    }
    
    // Content length validation (if present)
    if (req.body.content && typeof req.body.content === 'string') {
      if (req.body.content.length > 50000) {
        return res.status(400).json({ 
          success: false, 
          error: 'Post content too long (max 50000 characters)' 
        });
      }
    }
    
    // Excerpt length validation (if present)
    if (req.body.excerpt && typeof req.body.excerpt === 'string') {
      if (req.body.excerpt.length > 1000) {
        return res.status(400).json({ 
          success: false, 
          error: 'Post excerpt too long (max 1000 characters)' 
        });
      }
    }
    
    const post = await Post.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(400).json({ success: false, error: 'Failed to update post' });
  }
});

// DELETE post (admin)
router.delete('/posts/:id', requireAdmin, async (req: Request, res: Response) => {
  // Security: Ensure only DELETE method is accepted
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(400).json({ success: false, error: 'Failed to delete post' });
  }
});

export default router;
