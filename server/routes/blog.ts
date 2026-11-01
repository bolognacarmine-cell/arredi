import { Router, Request, Response, NextFunction } from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { invalidateSitemapCache } from './sitemap.js';
import { slugify, ensureUniqueSlug } from '../utils/slug.js';
import {
  validatePostInput,
  formatErrors,
  type ValidationError,
} from '../utils/postValidation.js';

const router = Router();

const DEFAULT_AUTHOR = { name: 'Farcom Arredi', role: 'Redazione' };
const MAX_PAGE_SIZE = 50;

/**
 * Le risposte di /api/blog non devono mai essere indicizzate: i contenuti
 * pubblici arrivano dalla pagina HTML (SPA), non dall'API JSON.
 */
router.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

/** Normalizza un query param express in stringa semplice. */
function str(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

/** Escape dell'input utente prima di costruire una RegExp di ricerca. */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function intParam(value: unknown, fallback: number, min: number, max: number): number {
  const raw = str(value);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

const SORTS: Record<string, Record<string, 1 | -1>> = {
  latest: { publishedAt: -1 },
  oldest: { publishedAt: 1 },
  title: { title: 1 },
  order: { order: 1, publishedAt: -1 },
};

function sendValidationErrors(res: Response, errors: ValidationError[]): Response {
  return res.status(400).json({
    success: false,
    error: formatErrors(errors),
    code: 'VALIDATION_ERROR',
    errors,
  });
}

/** True se lo slug è già usato da un altro articolo. */
async function slugIsTaken(slug: string, excludeId?: string): Promise<boolean> {
  const query: Record<string, unknown> = { slug };
  if (excludeId) query._id = { $ne: excludeId };
  const doc = await Post.findOne(query).select('_id').lean();
  return Boolean(doc);
}

/** Traduce l'errore E11000 di Mongo (indice unique) in un 409 esplicito. */
function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(
    error && typeof error === 'object' && 'code' in error && (error as { code?: number }).code === 11000
  );
}

/**
 * L'autore viene preso dall'utente della sessione admin quando il client non
 * lo invia: soddisfa il requisito di salvare sempre chi ha creato il pezzo.
 */
async function resolveAuthor(req: Request, bodyAuthor?: unknown): Promise<{ name: string; role: string; avatar?: string }> {
  const incoming = bodyAuthor as { name?: unknown; role?: unknown; avatar?: unknown } | undefined;
  if (incoming && typeof incoming.name === 'string' && incoming.name.trim()) {
    return {
      name: String(incoming.name).trim(),
      role: typeof incoming.role === 'string' && incoming.role.trim() ? incoming.role : 'Redazione',
      avatar: typeof incoming.avatar === 'string' ? incoming.avatar : undefined,
    };
  }

  const userId = (req.session as { userId?: string } | undefined)?.userId;
  if (userId) {
    try {
      const user = await User.findById(userId).select('name email role').lean();
      if (user) {
        return {
          name: user.name || user.email || DEFAULT_AUTHOR.name,
          role: user.role === 'admin' ? 'Amministratore' : 'Redattore',
        };
      }
    } catch (error) {
      console.warn('[blog] Impossibile risolvere l\'autore dalla sessione:', error);
    }
  }

  return { ...DEFAULT_AUTHOR };
}

/** Costruisce il payload sanitizzato: scarta le chiavi non previste. */
function pickPostPayload(body: Record<string, unknown>): Record<string, unknown> {
  const allowed = [
    'title', 'slug', 'sectorSlug', 'excerpt', 'content',
    'coverImage', 'coverImageAlt', 'images',
    'publishedAt', 'tags', 'relatedProductSlugs',
    'seoTitle', 'seoDescription', 'canonicalUrl', 'ogImage',
    'faq', 'internalLinks', 'featured', 'order', 'isPublished',
    'author',
  ];

  const payload: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) payload[key] = body[key];
  }

  if (Array.isArray(payload.tags)) {
    payload.tags = (payload.tags as unknown[]).filter((t) => typeof t === 'string' && t.trim()).map((t) => String(t).trim());
  }
  if (Array.isArray(payload.images)) {
    payload.images = (payload.images as unknown[]).filter((u) => typeof u === 'string' && u.trim());
  }
  if (Array.isArray(payload.relatedProductSlugs)) {
    payload.relatedProductSlugs = (payload.relatedProductSlugs as unknown[]).filter(
      (s) => typeof s === 'string' && s.trim()
    );
  }
  if (typeof payload.slug === 'string') payload.slug = payload.slug.trim().toLowerCase();
  if (typeof payload.sectorSlug === 'string') payload.sectorSlug = payload.sectorSlug.trim().toLowerCase();
  if (typeof payload.publishedAt === 'string' && payload.publishedAt === '') delete payload.publishedAt;

  return payload;
}

// ---------------------------------------------------------------------------
// PUBLIC
// ---------------------------------------------------------------------------

// GET all published posts with optional filters
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const sectorSlug = str(req.query.sectorSlug);
    const search = str(req.query.search);
    const featured = str(req.query.featured);
    const sortKey = str(req.query.sort) || 'latest';
    const pageNum = intParam(req.query.page, 1, 1, 100000);
    const limitNum = intParam(req.query.limit, 10, 1, MAX_PAGE_SIZE);
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = { isPublished: true };
    if (sectorSlug) query.sectorSlug = sectorSlug;
    if (featured === 'true') query.featured = true;
    if (search) {
      const pattern = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [{ title: pattern }, { excerpt: pattern }, { tags: pattern }];
    }

    const sort = SORTS[sortKey] || SORTS.latest;
    // Gli "in evidenza" restano in testa solo nell'ordinamento predefinito
    const finalSort = sortKey === 'latest' ? { featured: -1 as const, ...sort } : sort;

    const [posts, total] = await Promise.all([
      Post.find(query).sort(finalSort).skip(skip).limit(limitNum).lean(),
      Post.countDocuments(query),
    ]);

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

// GET all posts (incluse le bozze) — solo admin.
// Deve stare prima di /posts/:slug per non venire intercettato.
router.get('/posts/admin/list', requireAdmin, async (req: Request, res: Response) => {
  try {
    const sortKey = str(req.query.sort) || 'latest';
    const sort = SORTS[sortKey] || SORTS.latest;
    const posts = await Post.find({}).sort(sort).limit(500).lean();
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

// GET single post by slug (solo pubblicati: le bozze restano indicizzabili zero)
router.get('/posts/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug, isPublished: true }).lean();

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found', code: 'POST_NOT_FOUND' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch post' });
  }
});

// GET all sectors with post counts
router.get('/sectors', async (_req: Request, res: Response) => {
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
                { case: { $eq: ['$_id', 'barbieri'] }, then: 'Barbieri e Parrucchieri' },
                { case: { $eq: ['$_id', 'negozi'] }, then: 'Negozi' },
                { case: { $eq: ['$_id', 'scuole'] }, then: 'Scuole' },
                { case: { $eq: ['$_id', 'bar'] }, then: 'Bar' },
                { case: { $eq: ['$_id', 'centri-estetici'] }, then: 'Centri Estetici' },
                { case: { $eq: ['$_id', 'uffici'] }, then: 'Uffici' },
              ],
              default: {
                $concat: [
                  { $toUpper: { $substr: ['$_id', 0, 1] } },
                  { $substr: ['$_id', 1, 100] },
                ],
              },
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

// ---------------------------------------------------------------------------
// ADMIN (scrittura protetta da sessione admin)
// ---------------------------------------------------------------------------

// POST create new post (admin)
router.post('/posts', requireAdmin, async (req: Request, res: Response) => {
  try {
    const errors = validatePostInput(req.body, { partial: false });
    if (errors.length > 0) return sendValidationErrors(res, errors);

    const payload = pickPostPayload(req.body as Record<string, unknown>);

    // Slug: generato dal titolo quando assente, sempre verificato per univocità
    const baseSlug = typeof payload.slug === 'string' && payload.slug ? payload.slug : slugify(String(payload.title));
    if (!baseSlug) {
      return sendValidationErrors(res, [{ field: 'slug', message: 'Impossibile generare uno slug dal titolo' }]);
    }

    const slug = await ensureUniqueSlug(baseSlug, (candidate) => slugIsTaken(candidate));

    const author = await resolveAuthor(req, payload.author);

    const post = new Post({
      ...payload,
      slug,
      author: payload.author || author,
      isPublished: payload.isPublished === true,
    });

    await post.save();
    invalidateSitemapCache();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        error: 'Slug già utilizzato da un altro articolo',
        code: 'SLUG_DUPLICATE',
        errors: [{ field: 'slug', message: 'Slug già utilizzato da un altro articolo' }],
      });
    }
    console.error('Error creating post:', error);
    if (error && typeof error === 'object' && 'name' in error && (error as { name?: string }).name === 'ValidationError') {
      const details = ((error as { errors?: Record<string, { message: string }> }).errors || {});
      return res.status(400).json({
        success: false,
        error: 'Dati articolo non validi',
        code: 'VALIDATION_ERROR',
        errors: Object.entries(details).map(([field, value]) => ({ field, message: value.message })),
      });
    }
    res.status(400).json({ success: false, error: 'Failed to create post' });
  }
});

// PUT riordino manuale degli articoli (admin)
router.put('/posts/reorder', requireAdmin, async (req: Request, res: Response) => {
  try {
    const items = (req.body as { items?: unknown })?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Elenco articoli da riordinare non valido' });
    }

    const operations = items
      .filter((item): item is { id: string; order: number } => Boolean(item) && typeof item === 'object')
      .map((item) => ({
        updateOne: {
          filter: { _id: String((item as { id?: unknown }).id) },
          update: { $set: { order: Number((item as { order?: unknown }).order) || 0 } },
        },
      }));

    if (operations.length === 0) {
      return res.status(400).json({ success: false, error: 'Elenco articoli da riordinare non valido' });
    }

    const result = await Post.bulkWrite(operations);
    invalidateSitemapCache();
    res.json({ success: true, data: { modified: result.modifiedCount } });
  } catch (error) {
    console.error('Error reordering posts:', error);
    res.status(400).json({ success: false, error: 'Failed to reorder posts' });
  }
});

// PUT update post (admin)
router.put('/posts/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const errors = validatePostInput(req.body, { partial: true });
    if (errors.length > 0) return sendValidationErrors(res, errors);

    const payload = pickPostPayload(req.body as Record<string, unknown>);

    // Slug duplicato → 409 esplicito (l'indice unique è l'ultimo baluardo)
    if (typeof payload.slug === 'string') {
      if (await slugIsTaken(payload.slug, id)) {
        return res.status(409).json({
          success: false,
          error: 'Slug già utilizzato da un altro articolo',
          code: 'SLUG_DUPLICATE',
          errors: [{ field: 'slug', message: 'Slug già utilizzato da un altro articolo' }],
        });
      }
    }

    const post = await Post.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found', code: 'POST_NOT_FOUND' });
    }

    invalidateSitemapCache();
    res.json({ success: true, data: post });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        error: 'Slug già utilizzato da un altro articolo',
        code: 'SLUG_DUPLICATE',
        errors: [{ field: 'slug', message: 'Slug già utilizzato da un altro articolo' }],
      });
    }
    console.error('Error updating post:', error);
    if (error && typeof error === 'object' && 'name' in error && (error as { name?: string }).name === 'ValidationError') {
      const details = ((error as { errors?: Record<string, { message: string }> }).errors || {});
      return res.status(400).json({
        success: false,
        error: 'Dati articolo non validi',
        code: 'VALIDATION_ERROR',
        errors: Object.entries(details).map(([field, value]) => ({ field, message: value.message })),
      });
    }
    res.status(400).json({ success: false, error: 'Failed to update post' });
  }
});

// DELETE post (admin)
router.delete('/posts/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found', code: 'POST_NOT_FOUND' });
    }

    invalidateSitemapCache();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(400).json({ success: false, error: 'Failed to delete post' });
  }
});

export default router;
