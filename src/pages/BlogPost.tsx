import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  getPostBySlug,
  getPosts,
  formatPostDate,
  estimateReadingMinutes,
  type Post,
} from "../api/blogApi"
import SEOHead from "../components/SEOHead"
import BlogBreadcrumb from "../components/blog/BlogBreadcrumb"
import BlogFaq from "../components/blog/BlogFaq"
import BlogCard from "../components/blog/BlogCard"
import {
  SITE_URL,
  buildArticleSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
  postBreadcrumb,
} from "../lib/blogSchema"

/** Settori che corrispondono a una pagina di servizio reale del sito. */
const SECTOR_PAGE_IDS = ["barbieri", "uffici", "negozi", "scuole", "bar", "centri-estetici"]

const SECTOR_LABELS: Record<string, string> = {
  barbieri: "Barbieri e parrucchieri",
  uffici: "Uffici",
  negozi: "Negozi",
  scuole: "Scuole",
  bar: "Bar",
  "centri-estetici": "Centri estetici",
}

function absoluteUrl(value?: string): string | undefined {
  if (!value || !value.trim()) return undefined
  const trimmed = value.trim()
  if (trimmed.startsWith("/")) return `${SITE_URL}${trimmed}`
  return trimmed
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadPost() {
      setLoading(true)
      try {
        const postData = await getPostBySlug(slug || "")
        if (cancelled) return

        if (postData) {
          setPost(postData)
          // Articoli correlati: stesso settore, escludendo quello corrente
          const related = await getPosts({ sectorSlug: postData.sectorSlug, limit: 4 })
          if (!cancelled) {
            setRelatedPosts(related.data.filter((p) => p._id !== postData._id).slice(0, 3))
          }
        } else {
          setPost(null)
        }
      } catch (error) {
        console.error("Error loading post:", error)
        if (!cancelled) setPost(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPost()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <span
          className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin"
          role="status"
          aria-label="Caricamento articolo"
        />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)] mb-3">Errore 404</p>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--foreground)] mb-4">
            Articolo non trovato
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">
            L'articolo che cerchi non esiste più oppure non è ancora stato pubblicato.
          </p>
          <Link
            to="/blog"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:brightness-95"
          >
            Torna al blog
          </Link>
        </div>
      </div>
    )
  }

  const sectorLabel = SECTOR_LABELS[post.sectorSlug] || post.sectorSlug
  const readingMinutes = estimateReadingMinutes(post.content)
  const canonical = absoluteUrl(post.canonicalUrl) || `${SITE_URL}/blog/${post.slug}`
  const ogImage = absoluteUrl(post.ogImage) || absoluteUrl(post.coverImage)
  const faqSchema = buildFaqSchema(post)

  // Link interni: quelli inseriti in admin, in alternativa la pagina settore
  const sectorHref = SECTOR_PAGE_IDS.includes(post.sectorSlug) ? `/settori/${post.sectorSlug}` : null
  const internalLinks =
    post.internalLinks && post.internalLinks.length > 0
      ? post.internalLinks
      : sectorHref
        ? [{ label: `Arredi su misura per ${sectorLabel}`, url: sectorHref }]
        : []

  return (
    <>
      <SEOHead
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        canonical={canonical}
        ogImage={ogImage}
        ogType="article"
        schema={[
          buildArticleSchema(post),
          faqSchema,
          buildBreadcrumbSchema(postBreadcrumb(post)),
        ]}
      />

      <article className="min-h-screen bg-[var(--background)]">
        <BlogBreadcrumb items={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, { name: post.title }]} />

        {/* Header */}
        <header className="border-b border-[var(--border)] bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-12">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              <Link
                to={sectorHref || "/blog"}
                className="font-semibold uppercase tracking-wide text-[#E69138] hover:underline"
              >
                {sectorLabel}
              </Link>
              <span aria-hidden="true" className="text-[var(--muted-foreground)]">•</span>
              <time dateTime={post.publishedAt} className="text-[var(--muted-foreground)]">
                {formatPostDate(post.publishedAt)}
              </time>
              <span aria-hidden="true" className="text-[var(--muted-foreground)]">•</span>
              <span className="text-[var(--muted-foreground)]">{readingMinutes} min di lettura</span>
            </div>

            <h1 className="mb-5 font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.12] text-[var(--foreground)] text-balance">
              {post.title}
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-[var(--muted-foreground)]">{post.excerpt}</p>

            <div className="flex items-center gap-3">
              {post.author?.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-medium text-[var(--foreground)]">{post.author?.name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{post.author?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Copertina */}
        {post.coverImage && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-8">
            <img
              src={post.coverImage}
              alt={post.coverImageAlt?.trim() || `${post.title} — Farcom Arredi`}
              width={1200}
              height={675}
              loading="lazy"
              decoding="async"
              className="w-full rounded-lg border border-[var(--border)]"
            />
          </div>
        )}

        {/* Contenuto */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* FAQ (contenuto visibile = requisito per il JSON-LD FAQPage) */}
          <BlogFaq faq={post.faq} />

          {/* Link interni a pagine di servizio */}
          {internalLinks.length > 0 && (
            <section className="mt-10 rounded-lg border border-[var(--border)] bg-white p-5 sm:p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-[var(--foreground)]">
                Approfondisci
              </h2>
              <ul className="space-y-2">
                {internalLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.url}
                      className="inline-flex min-h-[36px] items-center gap-2 text-sm font-medium text-[#E69138] hover:underline"
                    >
                      <span aria-hidden="true">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* CTA finale */}
          <section className="mt-10 overflow-hidden rounded-xl bg-[var(--foreground)] px-6 py-8 sm:px-8">
            <h2 className="mb-2 font-display text-xl sm:text-2xl font-bold text-white">
              Vuoi lo stesso per il tuo locale?
            </h2>
            <p className="mb-6 max-w-xl text-sm leading-relaxed text-white/70">
              Sopralluogo, progettazione 3D, render, disegni esecutivi, produzione Made in Italy
              e installazione. Raccontaci il tuo spazio: ti rispondiamo con un preventivo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/preventivo"
                className="btn-primary-motion inline-flex min-h-[44px] items-center rounded-lg bg-[#E69138] px-6 py-3 text-sm font-semibold text-white transition-colors hover:brightness-95"
              >
                Richiedi un preventivo
              </Link>
              <Link
                to="/contatti"
                className="inline-flex min-h-[44px] items-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Contatta Farcom Arredi
              </Link>
            </div>
          </section>

          {/* Tag */}
          {post.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-[var(--border)]">
              <h2 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">Tag</h2>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="min-h-[36px] inline-flex items-center rounded-full border border-[var(--border)] bg-white px-3 py-1 text-sm text-[var(--foreground)] transition-colors hover:border-[#E69138] hover:bg-[#E69138] hover:text-white"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Articoli correlati */}
        {relatedPosts.length > 0 && (
          <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-14">
            <h2 className="mb-6 font-display text-2xl font-bold text-[var(--foreground)]">
              Leggi anche
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogCard
                  key={relatedPost._id}
                  post={relatedPost}
                  sectorLabel={SECTOR_LABELS[relatedPost.sectorSlug] || relatedPost.sectorSlug}
                  compact
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  )
}
