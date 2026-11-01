import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Post from '../models/Post.js';

// Il server è ESM ("type": "module"): __dirname non esiste a runtime.
// Stesso shim usato in index.ts.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = Router();

const SITE_URL = 'https://www.farcomarredi.it';
/** Cache in memoria: il crawler non deve colpire Mongo a ogni richiesta. */
const CACHE_TTL_MS = 10 * 60 * 1000;

interface SitemapCache {
  xml: string;
  at: number;
}

let cache: SitemapCache | null = null;

/** Ritorna la sitemap statica (pagine non-blog) copiata in dist/ a build time. */
function readStaticSitemap(): string | null {
  const candidates = [
    // sviluppo: server/routes/sitemap.ts → ../../dist
    path.resolve(__dirname, '../../dist/sitemap.xml'),
    // produzione: server/dist/routes/sitemap.js → ../../../dist
    path.resolve(__dirname, '../../../dist/sitemap.xml'),
    // cwd = root del progetto (comando avviato da lì)
    path.resolve(process.cwd(), 'dist/sitemap.xml'),
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return fs.readFileSync(candidate, 'utf8');
    } catch {
      /* prossimo candidato */
    }
  }
  return null;
}

function toIsoDate(value: unknown, fallback: string): string {
  if (value === undefined || value === null || value === '') return fallback;
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString().slice(0, 10);
}

/** Pagine statiche di fallback quando dist/sitemap.xml non è ancora presente. */
const FALLBACK_URLS = ['/', '/blog', '/settori', '/progetti', '/showroom', '/contatti', '/preventivo'];

function urlEntry(loc: string, lastmod: string, priority: string, changefreq = 'monthly'): string {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

export interface SitemapPost {
  slug: string;
  publishedAt?: unknown;
  updatedAt?: unknown;
}

/**
 * Composizione dell'XML (funzione PURA, testabile senza Mongo):
 * inietta gli articoli nella sitemap statica, o genera un urlset di fallback.
 */
export function renderSitemap(
  staticXml: string | null,
  posts: SitemapPost[],
  today = new Date().toISOString().slice(0, 10)
): string {
  const postUrls = posts
    .map((post) =>
      urlEntry(
        `${SITE_URL}/blog/${post.slug}`,
        toIsoDate(post.updatedAt, toIsoDate(post.publishedAt, today)),
        '0.7',
        'weekly'
      )
    )
    .join('\n');

  if (staticXml && staticXml.includes('</urlset>')) {
    // Inietta gli articoli prima della chiusura del urlset statico
    return staticXml.replace('</urlset>', `${postUrls}\n</urlset>`);
  }

  const fallbackUrls = FALLBACK_URLS.map((p, index) =>
    urlEntry(`${SITE_URL}${p}`, today, index === 0 ? '1.0' : '0.8', index === 0 ? 'daily' : 'monthly')
  ).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    fallbackUrls,
    postUrls,
    '</urlset>',
  ]
    .filter(Boolean)
    .join('\n');
}

async function buildSitemap(): Promise<string> {
  const posts = await Post.find({ isPublished: true })
    .select('slug publishedAt updatedAt')
    .sort({ publishedAt: -1 })
    .lean();

  return renderSitemap(readStaticSitemap(), posts as unknown as SitemapPost[]);
}

/**
 * Sitemap XML dinamica: pagine statiche (da dist/sitemap.xml) + tutti gli
 * articoli pubblicati. Le bozze non compaiono mai.
 *
 * Montata in server/index.ts PRIMA di express.static, così prevale sul file
 * statico.
 */
router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      res.type('application/xml').setHeader('Cache-Control', 'public, max-age=3600').send(cache.xml);
      return;
    }

    const xml = await buildSitemap();
    cache = { xml, at: Date.now() };

    res
      .type('application/xml')
      .setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
      .send(xml);
  } catch (error) {
    console.error('[sitemap] Errore nella generazione:', error);
    res.status(500).type('text/plain').send('Sitemap non disponibile');
  }
});

/** Svuota la cache dopo ogni scrittura su un articolo (chiamato dalle route blog). */
export function invalidateSitemapCache(): void {
  cache = null;
}

export default router;
