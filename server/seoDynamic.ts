import mongoose from 'mongoose';

import { Project } from './models/Project.js';
import Post from './models/Post.js';
import { Product } from './models/Product.js';

import {
  buildNotFoundSeo,
  buildPostSeo,
  buildProductSeo,
  buildProjectSeo,
  getSeoHead,
  normalizePathname,
  type PostMetaSource,
  type ProductMetaSource,
  type ProjectMetaSource,
  type SeoHead,
} from './seo.js';

/**
 * Metadati di <head> per le pagine di dettaglio.
 *
 * `getSeoHead()` in `seo.ts` è sincrona e non conosce il database: sulle route
 * dinamiche deve restituire un fallback generico. Qui recuperiamo il record
 * reale (progetto, articolo, prodotto) e costruiamo title/description/canonical
 * specifici, così ogni URL della sitemap ha metadati univoci nell'HTML iniziale
 * (Google li usa prima di eseguire il JavaScript).
 */

const DETAIL_PATTERN = /^\/(progetti|blog|showroom)\/([^/]+)$/;

// Etichette brevi per i <title> dei prodotti dello showroom.
const PRODUCT_SECTOR_LABELS: Record<string, string> = {
  barber: 'Barberie',
  office: 'Uffici',
  retail: 'Negozi',
  school: 'Scuole',
  other: 'Arredo',
};

interface CacheEntry {
  seo: SeoHead;
  expires: number;
}

// L'HTML non è cacheato dall'edge (Cache-Control: no-store), quindi ogni
// richiesta arriverebbe al database senza questa cache in memoria.
const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 500;
const cache = new Map<string, CacheEntry>();

function readCache(path: string): SeoHead | undefined {
  const entry = cache.get(path);
  if (!entry) return undefined;
  if (entry.expires <= Date.now()) {
    cache.delete(path);
    return undefined;
  }
  return entry.seo;
}

function writeCache(path: string, seo: SeoHead): SeoHead {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(path, { seo, expires: Date.now() + CACHE_TTL_MS });
  return seo;
}

/** Svuota la cache dei metadati (usata dai test e dopo le scritture admin). */
export function clearSeoCache(): void {
  cache.clear();
}

function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Converte una data del database in ISO 8601; restituisce undefined se assente o invalida. */
function toIsoDate(value?: Date | string | null): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function productSectorLabel(sector?: string, other?: string): string {
  if (sector === 'other') {
    const custom = (other || '').trim();
    return custom || PRODUCT_SECTOR_LABELS.other;
  }
  return (sector && PRODUCT_SECTOR_LABELS[sector]) || PRODUCT_SECTOR_LABELS.other;
}

export async function resolveSeoHead(pathname: string): Promise<SeoHead> {
  const path = normalizePathname(pathname);
  const fallback = getSeoHead(path);

  const match = DETAIL_PATTERN.exec(path);
  if (!match || !isDatabaseReady()) return fallback;

  const cached = readCache(path);
  if (cached) return cached;

  const section = match[1];
  const slug = decodeSlug(match[2]);
  let lookupFailed = false;

  try {
    if (section === 'progetti') {
      const project = await Project.findOne({
        $or: [{ id: slug }, { 'seo.slug': slug }],
      }).lean();

      if (project) {
        return writeCache(path, buildProjectSeo(project as unknown as ProjectMetaSource, path));
      }
    }

    if (section === 'blog') {
      const post = await Post.findOne({ slug }).lean();

      if (post) {
        const source = post as unknown as {
          isPublished?: boolean;
          publishedAt?: Date | string;
          updatedAt?: Date | string;
          author?: { name?: string; role?: string };
        };

        const seo = buildPostSeo(
          {
            ...(post as unknown as PostMetaSource),
            datePublished: toIsoDate(source.publishedAt),
            dateModified: toIsoDate(source.updatedAt),
            authorName: source.author?.name,
            authorRole: source.author?.role,
          },
          path,
        );

        // Le bozze restano fuori dall'indice anche se raggiunte via URL e non
        // devono esporre structured data.
        return writeCache(
          path,
          source.isPublished === false
            ? { ...seo, robots: 'noindex, nofollow', jsonLd: undefined }
            : seo,
        );
      }
    }

    if (section === 'showroom') {
      const product = await Product.findOne({ slug }).lean();

      if (product) {
        const source = product as unknown as ProductMetaSource & {
          activitySector?: string;
          activitySectorOther?: string;
        };

        return writeCache(
          path,
          buildProductSeo(
            {
              name: source.name,
              slug: source.slug,
              description: source.description,
              images: source.images,
              sectorLabel: productSectorLabel(source.activitySector, source.activitySectorOther),
            },
            path,
          ),
        );
      }
    }
  } catch (error) {
    lookupFailed = true;
    console.warn(
      `[seo] metadati non recuperati per ${path}:`,
      error instanceof Error ? error.message : error,
    );
  }

  // Un errore di lettura non deve trasformare una pagina valida in 404.
  if (lookupFailed) return fallback;

  // Database raggiungibile ma record assente: la pagina non esiste davvero.
  return writeCache(path, buildNotFoundSeo());
}
