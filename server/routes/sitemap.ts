import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { Product } from '../models/Product.js';
import Post from '../models/Post.js';

const SITE_URL = 'https://www.farcomarredi.it';
const CACHE_TTL_MS = 30 * 60 * 1000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_SITEMAP_CANDIDATES = [
  path.resolve(process.cwd(), 'dist', 'sitemap.xml'),
  path.resolve(__dirname, '../../../dist', 'sitemap.xml'),
  path.resolve(__dirname, '../../dist', 'sitemap.xml'),
];

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
};

const STATIC_PAGES: SitemapEntry[] = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/settori', changefreq: 'weekly', priority: '0.9' },
  { loc: '/progetti', changefreq: 'weekly', priority: '0.9' },
  { loc: '/showroom', changefreq: 'daily', priority: '0.8' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.7' },
  { loc: '/chi-siamo', changefreq: 'monthly', priority: '0.6' },
  { loc: '/contatti', changefreq: 'monthly', priority: '0.6' },
  { loc: '/preventivo', changefreq: 'monthly', priority: '0.8' },
  { loc: '/resto-al-sud-2-0', changefreq: 'monthly', priority: '0.7' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/cookie', changefreq: 'yearly', priority: '0.3' },
  { loc: '/termini-e-condizioni', changefreq: 'yearly', priority: '0.3' },
  { loc: '/note-legali', changefreq: 'yearly', priority: '0.3' },
];

const SECTOR_IDS = ['barbieri', 'uffici', 'negozi', 'scuole', 'bar', 'centri-estetici'];

let cache: { xml: string; expiresAt: number } | null = null;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

function renderSitemap(entries: SitemapEntry[]): string {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const entry of entries) {
    if (seen.has(entry.loc)) continue;
    seen.add(entry.loc);

    const lines = [`    <loc>${escapeXml(`${SITE_URL}${entry.loc}`)}</loc>`];
    if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    if (entry.priority) lines.push(`    <priority>${entry.priority}</priority>`);

    urls.push(`  <url>\n${lines.join('\n')}\n  </url>`);
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

function readStaticSitemap(): string | null {
  for (const candidate of STATIC_SITEMAP_CANDIDATES) {
    try {
      return fs.readFileSync(candidate, 'utf8');
    } catch {
      // prova il percorso successivo
    }
  }
  return null;
}

async function buildSitemap(): Promise<string> {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB non connesso');
  }

  const [projects, posts, products] = await Promise.all([
    Project.find({ status: { $ne: 'bozza' } }).select('id updatedAt').lean(),
    Post.find({ isPublished: true }).select('slug updatedAt').lean(),
    Product.find({ $or: [{ isSold: false }, { showSoldInFrontend: true }] })
      .select('slug updatedAt')
      .lean(),
  ]);

  const entries: SitemapEntry[] = [
    ...STATIC_PAGES,
    ...SECTOR_IDS.map((id) => ({
      loc: `/settori/${id}`,
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ];

  for (const project of projects as Array<Record<string, unknown>>) {
    if (typeof project.id !== 'string') continue;
    entries.push({
      loc: `/progetti/${project.id}`,
      lastmod: toIsoDate(project.updatedAt),
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  for (const post of posts as Array<Record<string, unknown>>) {
    if (typeof post.slug !== 'string') continue;
    entries.push({
      loc: `/blog/${post.slug}`,
      lastmod: toIsoDate(post.updatedAt),
      changefreq: 'monthly',
      priority: '0.6',
    });
  }

  for (const product of products as Array<Record<string, unknown>>) {
    if (typeof product.slug !== 'string') continue;
    entries.push({
      loc: `/showroom/${product.slug}`,
      lastmod: toIsoDate(product.updatedAt),
      changefreq: 'weekly',
      priority: '0.6',
    });
  }

  return renderSitemap(entries);
}

async function getSitemapXml(): Promise<string> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.xml;

  try {
    const xml = await buildSitemap();
    cache = { xml, expiresAt: now + CACHE_TTL_MS };
    return xml;
  } catch (error) {
    const fallback = readStaticSitemap();
    if (fallback) {
      console.warn(
        '[sitemap] generazione dinamica non disponibile, uso dist/sitemap.xml:',
        error instanceof Error ? error.message : error,
      );
      return fallback;
    }
    throw error;
  }
}

async function sendSitemap(_req: Request, res: Response): Promise<void> {
  try {
    const xml = await getSitemapXml();
    res.status(200);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(xml);
  } catch (error) {
    console.error('[sitemap] impossibile servire la sitemap:', error);
    res.status(500).type('text/plain; charset=utf-8').send('Sitemap non disponibile');
  }
}

const router = Router();

router.get('/sitemap.xml', sendSitemap);
router.get('/sitemap_index.xml', sendSitemap);
router.get('/sitemap-index.xml', sendSitemap);

export default router;
