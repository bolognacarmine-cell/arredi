import { useMemo, useState } from "react"
import type { FaqItem, InternalLink, Post } from "../../../api/blogApi"
import BlogCard from "../../blog/BlogCard"
import BlogBreadcrumb from "../../blog/BlogBreadcrumb"
import BlogFaq from "../../blog/BlogFaq"
import { formatPostDate, estimateReadingMinutes } from "../../../api/blogApi"
import { labelCls, inputCls } from "../blog/blogStyles"

export interface PreviewDraft {
  title: string
  slug: string
  sectorSlug: string
  excerpt: string
  content: string
  coverImage?: string
  coverImageAlt?: string
  seoTitle?: string
  seoDescription?: string
  publishedAt?: string
  isPublished: boolean
  author?: { name: string; role: string; avatar?: string }
  faq?: FaqItem[]
  internalLinks?: InternalLink[]
}

interface PostPreviewsProps {
  draft: PreviewDraft
  sectorLabel: string
  /** Indica se il contenuto è stato modificato dopo l'ultimo salvataggio. */
  isDirty?: boolean
}

/**
 * Anteprima in form: mostra esattamente come appariranno la card nel blog e
 * la pagina articolo, senza pubblicare.
 */
export default function PostPreviews({ draft, sectorLabel, isDirty }: PostPreviewsProps) {
  const [tab, setTab] = useState<"card" | "page">("card")

  const fakePost: Post = useMemo(
    () => ({
      _id: "preview",
      title: draft.title || "Titolo dell'articolo",
      slug: draft.slug || "slug-articolo",
      sectorSlug: draft.sectorSlug || "barbieri",
      excerpt: draft.excerpt || "L'estratto breve apparirà qui sotto il titolo nella card.",
      content: draft.content || "",
      coverImage: draft.coverImage,
      coverImageAlt: draft.coverImageAlt,
      author: draft.author || { name: "Farcom Arredi", role: "Redazione" },
      publishedAt: draft.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
      faq: draft.faq || [],
      internalLinks: draft.internalLinks || [],
      featured: false,
      order: 0,
      isPublished: draft.isPublished,
    }),
    [draft]
  )

  const readingMinutes = estimateReadingMinutes(draft.content)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Tipo di anteprima">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "card"}
            onClick={() => setTab("card")}
            className={`min-h-[36px] rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              tab === "card"
                ? "bg-[var(--primary)] text-white"
                : "border border-[#DDD9D0] bg-white text-[#4A4A46] hover:bg-[#F7F5F0]"
            }`}
          >
            Card nel blog
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "page"}
            onClick={() => setTab("page")}
            className={`min-h-[36px] rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              tab === "page"
                ? "bg-[var(--primary)] text-white"
                : "border border-[#DDD9D0] bg-white text-[#4A4A46] hover:bg-[#F7F5F0]"
            }`}
          >
            Pagina articolo
          </button>
        </div>
        <span className="text-xs text-[#888580]">
          {isDirty ? "Anteprima dei dati non ancora salvati" : "Anteprima dello stato salvato"}
        </span>
      </div>

      <div className="rounded-lg border border-[#DDD9D0] bg-[#F7F5F0] p-4">
        {tab === "card" ? (
          <div className="mx-auto max-w-[320px] pointer-events-none" aria-hidden="true">
            <BlogCard post={fakePost} sectorLabel={sectorLabel} />
          </div>
        ) : (
          <div className="pointer-events-none" aria-hidden="true">
            <div className="overflow-hidden rounded-lg border border-[#DDD9D0] bg-white">
              <BlogBreadcrumb
                items={[
                  { name: "Home" },
                  { name: "Blog" },
                  { name: draft.title || "Titolo dell'articolo" },
                ]}
              />
              <div className="px-4 py-5 sm:px-6">
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span className="font-semibold uppercase tracking-wide text-[#E69138]">
                    {sectorLabel}
                  </span>
                  <span className="text-[var(--muted-foreground)]">•</span>
                  <span className="text-[var(--muted-foreground)]">
                    {formatPostDate(draft.publishedAt || new Date().toISOString())}
                  </span>
                  <span className="text-[var(--muted-foreground)]">•</span>
                  <span className="text-[var(--muted-foreground)]">{readingMinutes} min di lettura</span>
                </div>

                <h1 className="mb-3 font-display text-2xl font-bold leading-tight text-[#1A1A2E]">
                  {draft.title || "Titolo dell'articolo"}
                </h1>

                <p className="mb-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {draft.excerpt || "Estratto breve dell'articolo."}
                </p>

                {draft.coverImage ? (
                  <img
                    src={draft.coverImage}
                    alt=""
                    width={1200}
                    height={675}
                    loading="lazy"
                    className="mb-4 w-full rounded border border-[#DDD9D0]"
                  />
                ) : (
                  <div className="mb-4 flex h-40 items-center justify-center rounded border border-dashed border-[#DDD9D0] bg-[#FAFAF7] text-xs text-[#888580]">
                    Nessuna copertina
                  </div>
                )}

                <div className="border-t border-[#DDD9D0] pt-4">
                  <h2 className="mb-2 font-display text-lg font-bold text-[#1A1A2E]">
                    Anteprima del contenuto
                  </h2>
                  <div className="line-clamp-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {draft.content
                      ? draft.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
                      : "Il contenuto dell'articolo apparirà in questa zona."}
                  </div>
                  {(draft.faq || []).length > 0 && (
                    <p className="mt-3 text-xs text-[#888580]">
                      {(draft.faq || []).length} domande FAQ verranno mostrate in fondo.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dati SEO della preview: utile per controllare title/description prima di andare live */}
      <div className="mt-4 rounded-lg border border-[#DDD9D0] bg-white p-4">
        <span className={labelCls}>Come apparirà su Google</span>
        <p className="text-sm text-[#1a0dab]">
          {(draft.seoTitle || draft.title || "Titolo articolo").slice(0, 60)}
        </p>
        <p className="mt-1 font-mono text-xs text-[#006621]">
          https://www.farcomarredi.it/blog/{draft.slug || "slug-articolo"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[#4d5156]">
          {(draft.seoDescription || draft.excerpt || "Meta description dell'articolo…").slice(0, 160)}
        </p>
      </div>
    </div>
  )
}
