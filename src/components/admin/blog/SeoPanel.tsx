import {
  labelCls,
  inputCls,
  hintCls,
  counterClass,
} from "../blog/blogStyles"
import { LIMITS } from "../../../lib/blogValidation"

interface SeoPanelProps {
  slug: string
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
  ogImage: string
  onSlugChange: (value: string) => void
  onGenerateSlug: () => void
  onSeoTitleChange: (value: string) => void
  onSeoDescriptionChange: (value: string) => void
  onCanonicalUrlChange: (value: string) => void
  onOgImageChange: (value: string) => void
  errors?: Record<string, string>
  warnings?: Record<string, string>
}

/**
 * Pannello SEO: slug, meta title, meta description, URL canonico e immagine
 * Open Graph, con i contatori e le validazioni richieste dalla spec
 * (meta title ≤ 60, meta description 140-155).
 */
export default function SeoPanel({
  slug,
  seoTitle,
  seoDescription,
  canonicalUrl,
  ogImage,
  onSlugChange,
  onGenerateSlug,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onCanonicalUrlChange,
  onOgImageChange,
  errors = {},
  warnings = {},
}: SeoPanelProps) {
  return (
    <div className="space-y-5">
      {/* Slug */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <label className={labelCls} htmlFor="post-slug">
            Slug URL *
          </label>
          <button
            type="button"
            onClick={onGenerateSlug}
            className="mb-1 text-xs font-medium text-[#1B4332] underline underline-offset-2 min-h-[28px]"
          >
            Genera dal titolo
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 text-xs text-[#888580]">
            /blog/
          </span>
          <input
            id="post-slug"
            type="text"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value.toLowerCase())}
            placeholder="arredamento-barbieri-caserta"
            aria-invalid={Boolean(errors.slug)}
            className={`${inputCls} font-mono text-xs`}
          />
        </div>
        <div className="mt-1 flex items-start justify-between gap-3">
          {errors.slug ? (
            <span className="text-xs text-red-600">{errors.slug}</span>
          ) : (
            <span className={hintCls}>
              Lettere minuscole, numeri e trattini. Deve essere univoco: l'errore "slug già
              utilizzato" ti verrà segnalato al salvataggio.
            </span>
          )}
          <span className={counterClass(slug.length, LIMITS.slug)}>
            {slug.length}/{LIMITS.slug}
          </span>
        </div>
      </div>

      {/* Meta title */}
      <div>
        <label className={labelCls} htmlFor="post-seo-title">
          Meta title
        </label>
        <input
          id="post-seo-title"
          type="text"
          value={seoTitle}
          onChange={(e) => onSeoTitleChange(e.target.value)}
          placeholder="Arredamento barbieri a Caserta e Macerata Campania"
          aria-invalid={Boolean(errors.seoTitle)}
          className={inputCls}
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          <span className="text-xs text-red-600">{errors.seoTitle || ""}</span>
          {!errors.seoTitle && warnings.seoTitle && (
            <span className="text-xs text-amber-600">{warnings.seoTitle}</span>
          )}
          <span className={counterClass(seoTitle.length, LIMITS.seoTitle)}>
            {seoTitle.length}/{LIMITS.seoTitle}
          </span>
        </div>
        {!seoTitle && (
          <span className={hintCls}>Vuoto: verrà usato il titolo dell'articolo.</span>
        )}
      </div>

      {/* Meta description */}
      <div>
        <label className={labelCls} htmlFor="post-seo-description">
          Meta description
        </label>
        <textarea
          id="post-seo-description"
          value={seoDescription}
          onChange={(e) => onSeoDescriptionChange(e.target.value)}
          rows={3}
          placeholder="Guida completa all'arredamento su misura per barbieri e parrucchieri a Caserta: sopralluogo, progettazione 3D e installazione."
          aria-invalid={Boolean(errors.seoDescription)}
          className={`${inputCls} resize-y`}
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          <span className="text-xs text-red-600">{errors.seoDescription || ""}</span>
          {!errors.seoDescription && warnings.seoDescription && (
            <span className="text-xs text-amber-600">{warnings.seoDescription}</span>
          )}
          <span className={counterClass(
            seoDescription.length,
            LIMITS.seoDescriptionIdealMax
          )}>
            {seoDescription.length} · ottimale 140-155
          </span>
        </div>
      </div>

      {/* URL canonico */}
      <div>
        <label className={labelCls} htmlFor="post-canonical">
          URL canonico (opzionale)
        </label>
        <input
          id="post-canonical"
          type="text"
          value={canonicalUrl}
          onChange={(e) => onCanonicalUrlChange(e.target.value)}
          placeholder="https://www.farcomarredi.it/blog/arredamento-barbieri-caserta"
          className={inputCls}
        />
        {errors.canonicalUrl ? (
          <span className="text-xs text-red-600">{errors.canonicalUrl}</span>
        ) : (
          <span className={hintCls}>
            Lascia vuoto per usare https://www.farcomarredi.it/blog/&lt;slug&gt;.
          </span>
        )}
      </div>

      {/* Immagine Open Graph */}
      <div>
        <label className={labelCls} htmlFor="post-og-image">
          Immagine Open Graph (opzionale)
        </label>
        <input
          id="post-og-image"
          type="text"
          value={ogImage}
          onChange={(e) => onOgImageChange(e.target.value)}
          placeholder="https://res.cloudinary.com/…/blog/copertina.jpg"
          className={inputCls}
        />
        <span className={hintCls}>
          1200×630 px consigliati. Se vuota si usa la copertina: è l'immagine che appare su
          WhatsApp, Facebook e LinkedIn.
        </span>
      </div>
    </div>
  )
}
