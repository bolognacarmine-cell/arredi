/**
 * BLOG API LOGIC - Fallback Strategy
 *
 * Questo file implementa una strategia di fallback robusta per i dati del blog:
 *
 * 1. Se VITE_API_BASE_URL è impostato:
 *    - prima si prova l'API
 *    - se l'API fallisce (errore di rete, 5xx, timeout) si usa il file statico
 *
 * 2. Se VITE_API_BASE_URL non è impostato:
 *    - richieste relative same-origin (in dev il proxy Vite punta a localhost:3002)
 *    - fallback sui dati statici se l'API fallisce
 *
 * 3. Dati statici di riserva: src/data/blogPosts.json
 *
 * Le scritture (create/update/delete/reorder) NON hanno fallback statico:
 * richiedono l'API e una sessione admin valida.
 */

import { getApiUrl, getApiBaseUrl } from '../lib/apiConfig'

// Static data for fallback (GitHub Pages and API failures)
import staticBlogPosts from '../data/blogPosts.json'

const API_BASE_URL = getApiBaseUrl()

// ---------------------------------------------------------------------------
// Tipi
// ---------------------------------------------------------------------------

export interface Author {
  name: string;
  role: string;
  avatar?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface InternalLink {
  label: string;
  url: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  sectorSlug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;
  images?: string[];
  author: Author;
  publishedAt: string;
  updatedAt: string;
  createdAt?: string;
  tags: string[];
  relatedProductSlugs?: string[];
  /** Meta title (max 60 caratteri). */
  seoTitle?: string;
  /** Meta description (max 160; range consigliato 140-155). */
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  faq: FaqItem[];
  internalLinks: InternalLink[];
  featured: boolean;
  order: number;
  isPublished: boolean;
}

/** Payload di create/update: campi obbligatori solo in creazione. */
export type PostInput = Omit<
  Post,
  '_id' | 'publishedAt' | 'updatedAt' | 'createdAt' | 'author'
> & {
  publishedAt?: string
  /** Opzionale: se omesso il server attribuisce l'articolo all'utente di sessione. */
  author?: Partial<Author>
};

export interface BlogSector {
  slug: string;
  title: string;
  count: number;
  coverImage?: string;
}

export interface PaginatedPostsResponse {
  success: boolean;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogApiErrorDetails {
  field: string;
  message: string;
}

/**
 * Errore dell'API blog con dettaglio per campo: l'admin lo usa per
 * evidenziare i campi invalidi (slug duplicato, meta title > 60, ...).
 */
export class BlogApiError extends Error {
  status?: number;
  code?: string;
  fields: Record<string, string>;

  constructor(message: string, options: { status?: number; code?: string; details?: BlogApiErrorDetails[] } = {}) {
    super(message);
    this.name = 'BlogApiError';
    this.status = options.status;
    this.code = options.code;
    this.fields = {}
    for (const detail of options.details || []) {
      if (detail && detail.field) this.fields[detail.field] = detail.message
    }
  }
}

// ---------------------------------------------------------------------------
// Normalizzazione
// ---------------------------------------------------------------------------

/** Garantisce che i nuovi campi esistano anche nei dati statici/vecchi. */
export function normalizePost(raw: Record<string, unknown>): Post {
  const post = { ...(raw as unknown as Post) }

  post.faq = Array.isArray(post.faq) ? post.faq : []
  post.internalLinks = Array.isArray(post.internalLinks) ? post.internalLinks : []
  post.tags = Array.isArray(post.tags) ? post.tags : []
  post.images = Array.isArray(post.images) ? post.images : []
  post.featured = post.featured === true
  post.order = typeof post.order === 'number' ? post.order : 0
  post.isPublished = post.isPublished === true
  post.author = post.author && typeof post.author === 'object' ? post.author : { name: 'Farcom Arredi', role: 'Redazione' }

  return post
}

// ---------------------------------------------------------------------------
// Lettura pubblica (con fallback statico)
// ---------------------------------------------------------------------------

function matchesSearch(post: Post, search?: string): boolean {
  if (!search) return true
  const needle = search.trim().toLowerCase()
  if (!needle) return true
  return (
    post.title.toLowerCase().includes(needle) ||
    post.excerpt.toLowerCase().includes(needle) ||
    post.tags.some((tag) => String(tag).toLowerCase().includes(needle))
  )
}

/** Dati statici di riserva: filtra, cerca, ordina e paginà in locale. */
function getPostsFromStatic(params?: {
  sectorSlug?: string;
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
  sort?: string;
}): PaginatedPostsResponse {
  let filteredPosts = (staticBlogPosts as unknown as Record<string, unknown>[])
    .map(normalizePost)
    .filter((p) => p.isPublished)

  if (params?.sectorSlug) {
    filteredPosts = filteredPosts.filter((p) => p.sectorSlug === params.sectorSlug)
  }
  if (params?.featured) {
    filteredPosts = filteredPosts.filter((p) => p.featured)
  }
  if (params?.search) {
    filteredPosts = filteredPosts.filter((p) => matchesSearch(p, params.search))
  }

  const sort = params?.sort || 'latest'
  filteredPosts.sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title, 'it')
    if (sort === 'oldest') return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    if (sort === 'order') return (a.order || 0) - (b.order || 0)
    // latest: in evidenza prima, poi data decrescente
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  const page = params?.page || 1
  const limit = params?.limit || 10
  const skip = (page - 1) * limit
  const paginatedPosts = filteredPosts.slice(skip, skip + limit)

  return {
    success: true,
    data: paginatedPosts,
    pagination: {
      page,
      limit,
      total: filteredPosts.length,
      totalPages: Math.ceil(filteredPosts.length / limit),
    },
  }
}

export async function getPosts(params?: {
  sectorSlug?: string;
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
  sort?: string;
}): Promise<PaginatedPostsResponse> {
  try {
    const queryParams = new URLSearchParams()
    if (params?.sectorSlug) queryParams.append('sectorSlug', params.sectorSlug)
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.search) queryParams.append('search', params.search)
    if (params?.featured) queryParams.append('featured', 'true')
    if (params?.sort) queryParams.append('sort', params.sort)

    const url = getApiUrl('/api/blog/posts')
    const response = await fetch(`${url}?${queryParams.toString()}`, {
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`API returned ${response.status}`)

    const result = await response.json()
    if (!result.success) throw new Error(result.error || 'Failed to fetch posts')

    return {
      ...result,
      data: (result.data as Record<string, unknown>[]).map(normalizePost),
    }
  } catch (error) {
    console.warn('[Blog API] API call failed, falling back to static data:', error)
    return getPostsFromStatic(params)
  }
}

function getPostFromStatic(slug: string): Post | null {
  const found = (staticBlogPosts as unknown as Record<string, unknown>[]).find(
    (p) => p.slug === slug && p.isPublished
  )
  return found ? normalizePost(found) : null
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const url = getApiUrl(`/api/blog/posts/${slug}`)
    const response = await fetch(url, { credentials: 'include', cache: 'no-store' })

    if (response.status === 404) return null
    if (!response.ok) throw new Error(`API returned ${response.status}`)

    const result = await response.json()
    if (result.success && result.data) return normalizePost(result.data)

    return null
  } catch (error) {
    console.warn('[Blog API] API call failed for post, falling back to static data:', error)
    return getPostFromStatic(slug)
  }
}

// Helper function to get sectors from static data
function getSectorsFromStatic(): BlogSector[] {
  const sectorMap = new Map<string, { count: number; latestPost: Post }>()

  const posts = (staticBlogPosts as unknown as Record<string, unknown>[]).map(normalizePost)
  posts.forEach((post) => {
    if (!post.isPublished) return
    const existing = sectorMap.get(post.sectorSlug)
    const isNewer = !existing || new Date(post.publishedAt) > new Date(existing.latestPost.publishedAt)
    sectorMap.set(post.sectorSlug, {
      count: (existing?.count || 0) + 1,
      latestPost: isNewer ? post : existing.latestPost,
    })
  })

  const sectorTitles: Record<string, string> = {
    'barbieri': 'Barbieri e Parrucchieri',
    'negozi': 'Negozi',
    'scuole': 'Scuole',
    'bar': 'Bar',
    'centri-estetici': 'Centri Estetici',
    'uffici': 'Uffici',
  }

  return Array.from(sectorMap.entries()).map(([slug, data]) => ({
    slug,
    title: sectorTitles[slug] || slug.charAt(0).toUpperCase() + slug.slice(1),
    count: data.count,
    coverImage: data.latestPost.coverImage,
  }))
}

export async function getSectors(): Promise<BlogSector[]> {
  try {
    const url = getApiUrl('/api/blog/sectors')
    const response = await fetch(url, { credentials: 'include' })

    if (!response.ok) throw new Error(`API returned ${response.status}`)

    const result = await response.json()
    if (result.success) return result.data

    return []
  } catch (error) {
    console.warn('[Blog API] API call failed for sectors, falling back to static data:', error)
    return getSectorsFromStatic()
  }
}

// ---------------------------------------------------------------------------
// Scrittura (solo admin — nessun fallback statico)
//
// Le richieste usano getApiUrl(): con VITE_API_BASE_URL impostata puntano
// all'API assoluta, altrimenti restano same-origin (proxy Vite in dev, Express
// che serve dist/ in produzione). Non serve nessun controllo sulla variabile:
// se l'API non è raggiungibile l'errore arriva dalla fetch.
// ---------------------------------------------------------------------------

async function readErrorResponse(response: Response, fallback: string): Promise<BlogApiError> {
  let payload: Record<string, unknown> | null = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  const details = Array.isArray(payload?.errors) ? (payload!.errors as BlogApiErrorDetails[]) : undefined
  const message =
    typeof payload?.error === 'string' && payload.error ? payload.error : fallback

  return new BlogApiError(message, {
    status: response.status,
    code: typeof payload?.code === 'string' ? payload.code : undefined,
    details,
  })
}

export async function createPost(data: PostInput): Promise<Post> {
  const response = await fetch(getApiUrl('/api/blog/posts'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) throw await readErrorResponse(response, 'Impossibile creare l\'articolo')

  const result = await response.json()
  if (result.success && result.data) return normalizePost(result.data)
  if (result._id) return normalizePost(result)

  throw new BlogApiError('Risposta non valida dal server')
}

export async function updatePost(id: string, data: Partial<PostInput>): Promise<Post> {
  const response = await fetch(getApiUrl(`/api/blog/posts/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) throw await readErrorResponse(response, 'Impossibile aggiornare l\'articolo')

  const result = await response.json()
  if (result.success && result.data) return normalizePost(result.data)
  if (result._id) return normalizePost(result)

  throw new BlogApiError('Risposta non valida dal server')
}

export async function deletePost(id: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/blog/posts/${id}`), {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) throw await readErrorResponse(response, 'Impossibile eliminare l\'articolo')
}

/** Elenco completo (bozze incluse) per il pannello admin. Ordinabile. */
export async function getAdminPosts(sort: 'latest' | 'oldest' | 'title' | 'order' = 'latest'): Promise<Post[]> {
  const response = await fetch(getApiUrl(`/api/blog/posts/admin/list?sort=${sort}`), {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) throw await readErrorResponse(response, 'Impossibile caricare gli articoli')

  const result = await response.json()
  if (!result.success) throw new BlogApiError(result.error || 'Impossibile caricare gli articoli')

  return (result.data as Record<string, unknown>[]).map(normalizePost)
}

/** Salva l'ordinamento manuale degli articoli (drag & drop in admin). */
export async function reorderPosts(items: Array<{ id: string; order: number }>): Promise<void> {
  const response = await fetch(getApiUrl('/api/blog/posts/reorder'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ items }),
  })

  if (!response.ok) throw await readErrorResponse(response, 'Impossibile riordinare gli articoli')
}

// ---------------------------------------------------------------------------
// Utilità
// ---------------------------------------------------------------------------

/** Genera uno slug SEO-friendly partendo dal titolo (stop words italiane escluse). */
export function generateSlug(title: string): string {
  const stopWords = [
    'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
    'in', 'con', 'per', 'da', 'a', 'su', 'di', 'del', 'dello', 'della',
    'dei', 'degli', 'delle', 'e', 'o', 'ma', 'perché', 'come', 'che', 'non',
  ]

  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .split(' ')
    .filter((word) => word && !stopWords.includes(word))
    .join('-')
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 60) // Limit length
    .replace(/-+$/g, '')
}

/** Minuti di lettura stimati: 200 parole/minuto sul testo del contenuto. */
export function estimateReadingMinutes(content: string): number {
  if (!content) return 1
  const text = content
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim()
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** Data in formato italiano lungo ("12 marzo 2026"). */
export function formatPostDate(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

/** La card mostra il badge "Novità" se l'articolo ha meno di 14 giorni. */
export function isRecent(dateString: string, days = 14): boolean {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return false
  return Date.now() - date.getTime() <= days * 24 * 60 * 60 * 1000
}

export { API_BASE_URL }
