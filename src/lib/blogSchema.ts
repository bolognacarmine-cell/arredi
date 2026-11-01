/**
 * Costruttori dei dati strutturati JSON-LD per il blog.
 *
 * Funzioni PURE (nessun DOM, nessun React): consumate da BlogPost.tsx e
 * verificabile dai test (Article, FAQPage, BreadcrumbList).
 */

import type { Post } from '../api/blogApi'

export const SITE_URL = 'https://www.farcomarredi.it'
export const SITE_NAME = 'Blog Farcom Arredi'
export const ORGANIZATION_NAME = 'Farcom S.r.l.'

export function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`
}

export function buildArticleSchema(post: Post): Record<string, unknown> {
  const description = post.seoDescription || post.excerpt
  const image = post.ogImage || post.coverImage

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    ...(image ? { image: [image] } : {}),
    author: {
      '@type': 'Organization',
      name: post.author?.name || ORGANIZATION_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl(post.slug),
    },
    inLanguage: 'it-IT',
  }
}

/** FAQPage solo se l'articolo ha almeno una domanda completa. */
export function buildFaqSchema(post: Post): Record<string, unknown> | null {
  const items = (post.faq || []).filter(
    (item) => item && item.question && item.question.trim() && item.answer && item.answer.trim()
  )
  if (items.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.trim(),
      },
    })),
  }
}

export interface BreadcrumbEntry {
  name: string
  item?: string
}

/** BreadcrumbList standard: il nodo finale non riporta `item` (pratica Google). */
export function buildBreadcrumbSchema(entries: BreadcrumbEntry[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      ...(entry.item ? { item: entry.item } : {}),
    })),
  }
}

export function postBreadcrumb(post: Post): BreadcrumbEntry[] {
  return [
    { name: 'Home', item: `${SITE_URL}/` },
    { name: 'Blog', item: `${SITE_URL}/blog` },
    { name: post.title },
  ]
}

/** Schema dell'elenco /blog (CollectionPage) per la pagina indice. */
export function buildBlogIndexSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: SITE_NAME,
    description:
      'Guide e consigli su arredo contract, arredi su misura e progettazione interni per barbieri, parrucchieri, negozi, uffici, bar, scuole e centri estetici.',
    url: `${SITE_URL}/blog`,
    inLanguage: 'it-IT',
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  }
}

/** Inietta più blocchi JSON-LD in una singola stringa sicura per <script>. */
export function serializeSchemas(schemas: Array<Record<string, unknown> | null>): string {
  return JSON.stringify(schemas.filter(Boolean)).replace(/</g, '\\u003c')
}
