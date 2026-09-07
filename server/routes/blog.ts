import { Router, Request, Response } from 'express';
import Post from '../models/Post.js';

const router = Router();

// GET all published posts with optional filters
router.get('/posts', async (req: Request, res: Response) => {
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
              ],
              default: { $toUpper: { $substr: ['$_id', 0, 1] } } + { $substr: ['$_id', 1, 100] },
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
    res.status(500).json({ success: false, error: 'Failed to fetch sectors' });
  }
});

// POST create new post (admin)
router.post('/posts', async (req: Request, res: Response) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ success: false, error: 'Failed to create post' });
  }
});

// PUT update post (admin)
router.put('/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
router.delete('/posts/:id', async (req: Request, res: Response) => {
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
