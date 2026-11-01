import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  createPost,
  updatePost,
  generateSlug,
  type Post,
  type PostInput,
  type FaqItem,
  type InternalLink,
} from "../../../api/blogApi"
import { validatePostForm, LIMITS, type ValidationMessages } from "../../../lib/blogValidation"
import PostEditor from "./PostEditor"
import FaqEditor from "./FaqEditor"
import InternalLinksEditor from "./InternalLinksEditor"
import SeoPanel from "./SeoPanel"
import PostPreviews from "./PostPreviews"
import SectionImageUploader from "../SectionImageUploader"
import {
  labelCls,
  inputCls,
  selectCls,
  sectionCls,
  sectionTitleCls,
  btnPrimaryCls,
  btnSecondaryCls,
  hintCls,
  counterClass,
} from "./blogStyles"

const SECTORS: Array<{ value: string; label: string }> = [
  { value: "barbieri", label: "Barbieri e parrucchieri" },
  { value: "uffici", label: "Uffici" },
  { value: "negozi", label: "Negozi" },
  { value: "scuole", label: "Scuole" },
  { value: "bar", label: "Bar" },
  { value: "centri-estetici", label: "Centri estetici" },
]

interface DraftState {
  title: string
  slug: string
  sectorSlug: string
  excerpt: string
  content: string
  coverImage: string
  coverImageAlt: string
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
  ogImage: string
  publishedAt: string
  isPublished: boolean
  featured: boolean
  authorName: string
  tags: string
  faq: FaqItem[]
  internalLinks: InternalLink[]
}

const EMPTY_DRAFT: DraftState = {
  title: "",
  slug: "",
  sectorSlug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  coverImageAlt: "",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  ogImage: "",
  publishedAt: "",
  isPublished: false,
  featured: false,
  authorName: "",
  tags: "",
  faq: [],
  internalLinks: [],
}

/** ISO → valore per <input type="datetime-local"> (locale, senza secondi). */
function toDatetimeLocal(value?: string): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function postToDraft(post: Post | null): DraftState {
  if (!post) return { ...EMPTY_DRAFT }
  return {
    title: post.title,
    slug: post.slug,
    sectorSlug: post.sectorSlug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage || "",
    coverImageAlt: post.coverImageAlt || "",
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
    canonicalUrl: post.canonicalUrl || "",
    ogImage: post.ogImage || "",
    publishedAt: toDatetimeLocal(post.publishedAt),
    isPublished: post.isPublished,
    featured: post.featured,
    authorName: post.author?.name || "",
    tags: (post.tags || []).join(", "),
    faq: (post.faq || []).map((item) => ({ ...item })),
    internalLinks: (post.internalLinks || []).map((item) => ({ ...item })),
  }
}

interface PostFormProps {
  post: Post | null
}

export default function PostForm({ post }: PostFormProps) {
  const navigate = useNavigate()
  const isNew = !post

  const [draft, setDraft] = useState<DraftState>(() => postToDraft(post))
  const [messages, setMessages] = useState<ValidationMessages>({ errors: {}, warnings: {} })
  const [saving, setSaving] = useState(false)
  const [savedLabel, setSavedLabel] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [errorToast, setErrorToast] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const baselineRef = useRef<string>(JSON.stringify(postToDraft(post)))

  // Reset del form quando cambia l'articolo (nuovo / apertura di un altro)
  useEffect(() => {
    const next = postToDraft(post)
    setDraft(next)
    setMessages({ errors: {}, warnings: {} })
    baselineRef.current = JSON.stringify(next)
    setShowPreview(false)
  }, [post])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }, [])

  const showError = useCallback((message: string) => {
    setErrorToast(message)
    window.setTimeout(() => setErrorToast(null), 7000)
  }, [])

  const patch = useCallback((changes: Partial<DraftState>) => {
    setDraft((prev) => ({ ...prev, ...changes }))
  }, [])

  const sectorOptions = useMemo(() => {
    const known = new Set(SECTORS.map((s) => s.value))
    if (draft.sectorSlug && !known.has(draft.sectorSlug)) {
      return [...SECTORS, { value: draft.sectorSlug, label: draft.sectorSlug }]
    }
    return SECTORS
  }, [draft.sectorSlug])

  const sectorLabel =
    sectorOptions.find((s) => s.value === draft.sectorSlug)?.label || draft.sectorSlug || "Settore"

  const isDirty = JSON.stringify(draft) !== baselineRef.current

  const handleGenerateSlug = () => {
    if (!draft.title.trim()) {
      showError("Scrivi prima il titolo per generare lo slug")
      return
    }
    patch({ slug: generateSlug(draft.title) })
  }

  /** Titolo → slug automatico solo se lo slug non è stato toccato dall'utente. */
  const handleTitle = (value: string) => {
    const changes: Partial<DraftState> = { title: value }
    const baselineTitle = JSON.parse(baselineRef.current) as DraftState
    const slugWasPristine =
      !draft.slug || draft.slug === generateSlug(baselineTitle.title) || draft.slug === generateSlug(draft.title)
    if (slugWasPristine) changes.slug = generateSlug(value)
    patch(changes)
  }

  const buildPayload = (isPublished: boolean): PostInput => ({
    title: draft.title.trim(),
    slug: draft.slug.trim(),
    sectorSlug: draft.sectorSlug.trim(),
    excerpt: draft.excerpt.trim(),
    content: draft.content,
    coverImage: draft.coverImage.trim(),
    coverImageAlt: draft.coverImageAlt.trim(),
    seoTitle: draft.seoTitle.trim(),
    seoDescription: draft.seoDescription.trim(),
    canonicalUrl: draft.canonicalUrl.trim(),
    ogImage: draft.ogImage.trim(),
    isPublished,
    featured: draft.featured,
    order: post?.order ?? 0,
    tags: draft.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    faq: draft.faq.filter((item) => item.question?.trim() && item.answer?.trim()),
    internalLinks: draft.internalLinks.filter((item) => item.label?.trim() && item.url?.trim()),
    ...(draft.publishedAt ? { publishedAt: new Date(draft.publishedAt).toISOString() } : {}),
    ...(draft.authorName.trim()
      ? { author: { name: draft.authorName.trim(), role: post?.author?.role || "Redazione" } }
      : {}),
  })

  const save = async (nextPublishedState: boolean, successMessage: string) => {
    const result = validatePostForm(draft, { isNew })
    setMessages(result)

    if (Object.keys(result.errors).length > 0) {
      showError("Controlla i campi evidenziati in rosso prima di salvare")
      return
    }

    setSaving(true)
    try {
      const payload = buildPayload(nextPublishedState)

      if (isNew) {
        await createPost(payload)
      } else if (post) {
        await updatePost(post._id, payload)
      }

      baselineRef.current = JSON.stringify({ ...draft, isPublished: nextPublishedState })
      setDraft((prev) => ({ ...prev, isPublished: nextPublishedState }))
      setSavedLabel(successMessage)
      window.setTimeout(() => setSavedLabel(null), 2200)
      showToast(successMessage)

      if (isNew) {
        // Torna all'elenco: il toast viene mostrato dalla pagina AdminBlog
        navigate("/admin/blog", { state: { toast: "Articolo creato" } })
      }
    } catch (error) {
      console.error("[PostForm] salvataggio fallito:", error)

      if (error && typeof error === "object" && "fields" in error) {
        const fields = (error as { fields: Record<string, string> }).fields
        if (Object.keys(fields).length > 0) {
          setMessages((prev) => ({ errors: { ...fields }, warnings: prev.warnings }))
        }
      }

      const message = error instanceof Error ? error.message : "Impossibile salvare l'articolo"
      showError(message)
    } finally {
      setSaving(false)
    }
  }

  const errorCount = Object.keys(messages.errors).length
  const warningCount = Object.keys(messages.warnings).length

  return (
    <div>
      {/* Intestazione */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/blog")}
              className="text-sm text-[#888580] underline-offset-2 hover:text-[#1B4332] hover:underline min-h-[32px]"
            >
              ← Elenco articoli
            </button>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                draft.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {draft.isPublished ? "Pubblicato" : "Bozza"}
            </span>
            {draft.featured && (
              <span className="rounded-full bg-[#E69138]/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#B5761F]">
                In evidenza
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1A1A18]">
            {isNew ? "Nuovo articolo" : "Modifica articolo"}
          </h1>
          <p className="mt-1 text-sm text-[#888580]">
            {errorCount > 0
              ? `${errorCount} errore${errorCount === 1 ? "" : "i"} da correggere`
              : warningCount > 0
                ? `${warningCount} avvis${warningCount === 1 ? "o" : "i"} (non bloccanti)`
                : isDirty
                  ? "Modifiche non salvate"
                  : "Tutto salvato"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((value) => !value)}
            className={btnSecondaryCls}
            aria-expanded={showPreview}
          >
            {showPreview ? "Nascondi anteprima" : "Mostra anteprima"}
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
      >
        {/* ---------------- Colonna principale ---------------- */}
        <div>
          {/* Contenuto */}
          <section className={`${sectionCls} animate-fade-in`}>
            <h2 className={sectionTitleCls}>Contenuto</h2>

            <label className={labelCls} htmlFor="post-title">
              Titolo *
            </label>
            <input
              id="post-title"
              type="text"
              value={draft.title}
              onChange={(e) => handleTitle(e.target.value)}
              placeholder="Arredamento barbieri a Caserta e Macerata Campania"
              aria-invalid={Boolean(messages.errors.title)}
              className={inputCls}
            />
            <div className="mt-1 flex items-start justify-between gap-3">
              <span className="text-xs text-red-600">{messages.errors.title || ""}</span>
              <span className={counterClass(draft.title.length, LIMITS.title)}>
                {draft.title.length}/{LIMITS.title}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="post-sector">
                  Categoria / settore *
                </label>
                <select
                  id="post-sector"
                  value={draft.sectorSlug}
                  onChange={(e) => patch({ sectorSlug: e.target.value })}
                  aria-invalid={Boolean(messages.errors.sectorSlug)}
                  className={selectCls}
                >
                  <option value="">Seleziona un settore…</option>
                  {sectorOptions.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
                {messages.errors.sectorSlug && (
                  <span className="text-xs text-red-600">{messages.errors.sectorSlug}</span>
                )}
              </div>

              <div>
                <label className={labelCls} htmlFor="post-tags">
                  Tag (separati da virgola)
                </label>
                <input
                  id="post-tags"
                  type="text"
                  value={draft.tags}
                  onChange={(e) => patch({ tags: e.target.value })}
                  placeholder="arredo contract, barbieri, Caserta"
                  className={inputCls}
                />
              </div>
            </div>

            <label className={`${labelCls} mt-4`} htmlFor="post-excerpt">
              Estratto breve *
            </label>
            <textarea
              id="post-excerpt"
              value={draft.excerpt}
              onChange={(e) => patch({ excerpt: e.target.value })}
              rows={3}
              placeholder="Sintesi dell'articolo mostrata nella card e nella meta description."
              aria-invalid={Boolean(messages.errors.excerpt)}
              className={inputCls}
            />
            <div className="mt-1 flex items-start justify-between gap-3">
              <span className="text-xs text-red-600">{messages.errors.excerpt || ""}</span>
              <span className={counterClass(draft.excerpt.length, LIMITS.excerpt)}>
                {draft.excerpt.length}/{LIMITS.excerpt}
              </span>
            </div>

            <label className={`${labelCls} mt-4`}>
              Contenuto completo *
            </label>
            <PostEditor
              value={draft.content}
              onChange={(html) => patch({ content: html })}
              error={messages.errors.content}
            />
          </section>

          {/* URL e SEO */}
          <section className={`${sectionCls} animate-fade-in`}>
            <h2 className={sectionTitleCls}>URL e SEO</h2>
            <SeoPanel
              slug={draft.slug}
              seoTitle={draft.seoTitle}
              seoDescription={draft.seoDescription}
              canonicalUrl={draft.canonicalUrl}
              ogImage={draft.ogImage}
              onSlugChange={(value) => patch({ slug: value })}
              onGenerateSlug={handleGenerateSlug}
              onSeoTitleChange={(value) => patch({ seoTitle: value })}
              onSeoDescriptionChange={(value) => patch({ seoDescription: value })}
              onCanonicalUrlChange={(value) => patch({ canonicalUrl: value })}
              onOgImageChange={(value) => patch({ ogImage: value })}
              errors={messages.errors}
              warnings={messages.warnings}
            />
          </section>

          {/* Immagini */}
          <section className={`${sectionCls} animate-fade-in`}>
            <h2 className={sectionTitleCls}>Immagine di copertina</h2>
            <SectionImageUploader
              value={draft.coverImage ? [draft.coverImage] : []}
              onChange={(urls) => patch({ coverImage: urls[urls.length - 1] || "" })}
              multiple={false}
              maxFiles={1}
              maxSizeMB={8}
              category="blog"
              onError={(message) => showError(message)}
            />
            <div className="mt-4">
              <label className={labelCls} htmlFor="post-cover-alt">
                Alt text immagine
              </label>
              <input
                id="post-cover-alt"
                type="text"
                value={draft.coverImageAlt}
                onChange={(e) => patch({ coverImageAlt: e.target.value })}
                placeholder="Bancone reception in noce con specchiere retroilluminate"
                className={inputCls}
              />
              <div className="mt-1 flex items-start justify-between gap-3">
                <span className="text-xs text-red-600">{messages.errors.coverImageAlt || ""}</span>
                {!messages.errors.coverImageAlt && messages.warnings.coverImageAlt && (
                  <span className="text-xs text-amber-600">{messages.warnings.coverImageAlt}</span>
                )}
                <span className={counterClass(draft.coverImageAlt.length, LIMITS.coverImageAlt)}>
                  {draft.coverImageAlt.length}/{LIMITS.coverImageAlt}
                </span>
              </div>
              {messages.warnings.coverImage && (
                <span className="text-xs text-amber-600">{messages.warnings.coverImage}</span>
              )}
            </div>
          </section>

          {/* FAQ */}
          <section className={`${sectionCls} animate-fade-in`}>
            <h2 className={sectionTitleCls}>FAQ</h2>
            <FaqEditor
              value={draft.faq}
              onChange={(faq) => patch({ faq })}
              errors={messages.errors}
            />
          </section>

          {/* Link interni */}
          <section className={`${sectionCls} animate-fade-in`}>
            <h2 className={sectionTitleCls}>Link interni suggeriti</h2>
            <InternalLinksEditor
              value={draft.internalLinks}
              onChange={(internalLinks) => patch({ internalLinks })}
              errors={messages.errors}
            />
          </section>
        </div>

        {/* ---------------- Colonna laterale ---------------- */}
        <aside className="space-y-6">
          {/* Pubblicazione */}
          <section className={`${sectionCls} animate-fade-in`}>
            <h2 className={sectionTitleCls}>Pubblicazione</h2>

            <label className={labelCls} htmlFor="post-published-at">
              Data di pubblicazione
            </label>
            <input
              id="post-published-at"
              type="datetime-local"
              value={draft.publishedAt}
              onChange={(e) => patch({ publishedAt: e.target.value })}
              className={inputCls}
            />
            <span className={hintCls}>
              {draft.publishedAt
                ? `Programmato per il ${new Date(draft.publishedAt).toLocaleString("it-IT")}`
                : "Vuota: verrà usata la data di creazione."}
            </span>
            {messages.errors.publishedAt && (
              <span className="text-xs text-red-600">{messages.errors.publishedAt}</span>
            )}

            <label className={`${labelCls} mt-4`} htmlFor="post-author">
              Autore
            </label>
            <input
              id="post-author"
              type="text"
              value={draft.authorName}
              onChange={(e) => patch({ authorName: e.target.value })}
              placeholder="Farcom Arredi"
              className={inputCls}
            />
            <span className={hintCls}>
              Vuoto: viene usato l'utente admin che esegue il salvataggio.
            </span>

            <label className="mt-5 flex items-start gap-3 text-sm text-[#4A4A46]">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => patch({ featured: e.target.checked })}
                className="mt-1 h-4 w-4 accent-[#1B4332]"
              />
              <span>
                <strong className="block font-medium text-[#1A1A18]">In evidenza</strong>
                <span className="text-xs text-[#888580]">
                  Puntato in testa all'elenco del blog.
                </span>
              </span>
            </label>

            <label className="mt-4 flex items-start gap-3 text-sm text-[#4A4A46]">
              <input
                type="checkbox"
                checked={draft.isPublished}
                onChange={(e) => patch({ isPublished: e.target.checked })}
                className="mt-1 h-4 w-4 accent-[#1B4332]"
              />
              <span>
                <strong className="block font-medium text-[#1A1A18]">Pubblicato</strong>
                <span className="text-xs text-[#888580]">
                  Spostato: gli articoli non pubblicati restano fuori dall'elenco, dalla sitemap
                  e dall'indicizzazione.
                </span>
              </span>
            </label>
          </section>

          {/* Anteprima */}
          {showPreview && (
            <section className={`${sectionCls} animate-fade-in`}>
              <h2 className={sectionTitleCls}>Anteprima</h2>
              <PostPreviews
                draft={{
                  title: draft.title,
                  slug: draft.slug,
                  sectorSlug: draft.sectorSlug,
                  excerpt: draft.excerpt,
                  content: draft.content,
                  coverImage: draft.coverImage || undefined,
                  coverImageAlt: draft.coverImageAlt || undefined,
                  seoTitle: draft.seoTitle,
                  seoDescription: draft.seoDescription,
                  publishedAt: draft.publishedAt ? new Date(draft.publishedAt).toISOString() : undefined,
                  isPublished: draft.isPublished,
                  faq: draft.faq,
                  internalLinks: draft.internalLinks,
                }}
                sectorLabel={sectorLabel}
                isDirty={isDirty}
              />
            </section>
          )}
        </aside>

        {/* ---------------- Barra azioni ---------------- */}
        <div className="xl:col-span-2 border-t border-[#DDD9D0] pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => save(draft.isPublished, "Salvato")}
              disabled={saving}
              className={btnPrimaryCls}
            >
              {saving ? "Salvataggio…" : savedLabel || (isNew ? "Crea articolo" : "Salva")}
            </button>

            <button
              type="button"
              onClick={() => save(false, "Salvato come bozza")}
              disabled={saving}
              className={btnSecondaryCls}
            >
              Salva come bozza
            </button>

            <button
              type="button"
              onClick={() => save(true, "Articolo pubblicato")}
              disabled={saving}
              className={`${btnPrimaryCls} !bg-[#E69138] hover:!bg-[#c9761b]`}
            >
              Pubblica
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/blog")}
              disabled={saving}
              className={btnSecondaryCls}
            >
              Annulla
            </button>

            {errorCount > 0 && (
              <span className="text-xs text-red-600">
                Correggi {errorCount} campo{errorCount === 1 ? "" : "i"} per salvare.
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#1A1A18] text-white text-sm px-5 py-2.5 shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-md bg-red-700 text-white text-sm px-5 py-2.5 shadow-2xl animate-fade-in">
          {errorToast}
        </div>
      )}
    </div>
  )
}
