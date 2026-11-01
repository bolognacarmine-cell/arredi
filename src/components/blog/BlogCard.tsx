import { Link } from 'react-router-dom'
import { formatPostDate, isRecent, estimateReadingMinutes, type Post } from '../../api/blogApi'

interface BlogCardProps {
  post: Post
  /** Etichetta leggibile del settore (già risolta dalla pagina). */
  sectorLabel?: string
  /** Le prime card della pagina vengono caricate in fretta (LCP). */
  eager?: boolean
  /** Versione compatta per i correlati. */
  compact?: boolean
}

/**
 * Card articolo del blog.
 *
 * Coerente con le card esistenti (bianche, font-display, accento #E69138,
 * sistema .card-motion) ma DISTINTIVA da quella dei settori: lì l'immagine è
 * in bleed 3/4 con testo in sovrimpressione, qui immagine 16:10 in testa e
 * contenuto tipografico sotto, con badge "Novità" e datario.
 */
export default function BlogCard({ post, sectorLabel, eager = false, compact = false }: BlogCardProps) {
  const recent = isRecent(post.publishedAt)
  const minutes = estimateReadingMinutes(post.content)
  const alt = post.coverImageAlt?.trim() || post.title

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={[
        'group relative flex flex-col overflow-hidden bg-white border border-[var(--border)]',
        'card-motion min-h-[44px]',
        compact ? 'rounded-lg' : 'rounded-lg h-full',
      ].join(' ')}
      aria-label={`${post.title} — Leggi l'articolo`}
    >
      {/* Immagine */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--secondary)]">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={alt}
            width={1600}
            height={1000}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'low'}
            decoding="async"
            className="w-full h-full object-cover card-motion-media"
          />
        ) : (
          <div
            aria-hidden="true"
            className="w-full h-full bg-gradient-to-br from-[#E69138]/25 via-[var(--secondary)] to-[var(--muted)]"
          />
        )}

        {recent && (
          <span className="absolute top-3 left-3 rounded-full bg-[#E69138] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
            Novità
          </span>
        )}
      </div>

      {/* Contenuto */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold uppercase tracking-wide text-[#E69138]">
            {sectorLabel || post.sectorSlug}
          </span>
          <span aria-hidden="true" className="text-[var(--muted-foreground)]">•</span>
          <time dateTime={post.publishedAt} className="text-[var(--muted-foreground)]">
            {formatPostDate(post.publishedAt)}
          </time>
          {!compact && (
            <>
              <span aria-hidden="true" className="text-[var(--muted-foreground)]">•</span>
              <span className="text-[var(--muted-foreground)]">{minutes} min di lettura</span>
            </>
          )}
        </div>

        <h3
          className={[
            'font-display font-bold text-[var(--foreground)] leading-snug',
            'line-clamp-2 mb-2 group-hover:text-[#E69138] transition-colors',
            compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl',
          ].join(' ')}
        >
          {post.title}
        </h3>

        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {post.excerpt}
        </p>

        <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[#E69138] card-motion-cta">
          Leggi l'articolo
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  )
}

/** Skeleton della card usato durante il caricamento della griglia. */
export function BlogCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-lg border border-[var(--border)] bg-white animate-pulse"
    >
      <div className="aspect-[16/10] bg-[var(--muted)]" />
      <div className="p-5 sm:p-6">
        <div className="mb-3 h-3 w-24 rounded bg-[var(--muted)]" />
        <div className="mb-2 h-5 w-3/4 rounded bg-[var(--muted)]" />
        <div className="mb-4 h-4 w-full rounded bg-[var(--muted)]" />
        <div className="h-4 w-1/3 rounded bg-[var(--muted)]" />
      </div>
    </div>
  )
}
