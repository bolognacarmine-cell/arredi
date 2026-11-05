import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  getPosts,
  getSectors,
  type Post,
  type BlogSector,
} from "../api/blogApi"
import BlogCard, { BlogCardSkeleton } from "../components/blog/BlogCard"
import SEOHead from "../components/SEOHead"
import { LOCAL_PAGE_KEYWORDS } from "../lib/localSeo"
import {
  buildBlogIndexSchema,
  buildBreadcrumbSchema,
} from "../lib/blogSchema"

/** Filtri richiesti dalla spec, presenti anche se il settore non ha articoli. */
const FIXED_SECTORS: Array<{ slug: string; label: string }> = [
  { slug: "barbieri", label: "Barbieri e parrucchieri" },
  { slug: "uffici", label: "Uffici" },
  { slug: "negozi", label: "Negozi" },
  { slug: "scuole", label: "Scuole" },
  { slug: "bar", label: "Bar" },
  { slug: "centri-estetici", label: "Centri estetici" },
]

const PAGE_SIZE = 9

const META_TITLE = "Blog Farcom Arredi: arredo contract e progettazione interni"
const META_DESCRIPTION =
  "Guide su arredo contract, arredi su misura e progettazione interni per barbieri, negozi, uffici, bar e centri estetici. Idee e consigli da Farcom Arredi."

export default function Blog() {
  const [searchParams] = useSearchParams()
  // /blog?tag=... arriva dai tag in fondo all'articolo: la trattiamo come ricerca
  const initialSearch = searchParams.get("tag") || searchParams.get("search") || ""

  const [posts, setPosts] = useState<Post[]>([])
  const [sectors, setSectors] = useState<BlogSector[]>([])
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [appliedSearch, setAppliedSearch] = useState(initialSearch)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const debounceRef = useRef<number | null>(null)

  // Reset dello scroll (stesso pattern usato nelle altre pagine)
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    setTimeout(() => window.scrollTo(0, 0), 100)
    setTimeout(() => window.scrollTo(0, 0), 300)
  }, [])

  // Settori: caricati una sola volta
  useEffect(() => {
    let cancelled = false
    getSectors()
      .then((data) => {
        if (!cancelled) setSectors(data)
      })
      .catch(() => {
        /* i filtri fissi restano comunque disponibili */
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Ricerca con debounce
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [searchInput])

  // Caricamento articoli (prima pagina → sostituisci, pagine successive → append)
  useEffect(() => {
    let cancelled = false

    async function loadData() {
      if (page === 1) setLoading(true)
      else setLoadingMore(true)
      setError(null)

      try {
        const result = await getPosts({
          sectorSlug: selectedSector || undefined,
          search: appliedSearch || undefined,
          page,
          limit: PAGE_SIZE,
        })
        if (cancelled) return

        setTotalPages(result.pagination.totalPages)
        setPosts((prev) => {
          if (page === 1) return result.data
          const known = new Set(prev.map((p) => p._id))
          return [...prev, ...result.data.filter((p) => !known.has(p._id))]
        })
      } catch (err) {
        if (cancelled) return
        console.error("Error loading blog data:", err)
        setError("Non riuscito a caricare gli articoli. Riprova tra qualche istante.")
      } finally {
        if (!cancelled) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [selectedSector, appliedSearch, page])

  /** Etichette: i filtri fissi prima, poi eventuali settori tornati dall'API. */
  const sectorFilters = useMemo(() => {
    const known = new Set(FIXED_SECTORS.map((s) => s.slug))
    const extra = sectors
      .filter((s) => !known.has(s.slug))
      .map((s) => ({ slug: s.slug, label: s.title }))
    return [...FIXED_SECTORS, ...extra]
  }, [sectors])

  const sectorLabel = (slug: string) =>
    sectorFilters.find((s) => s.slug === slug)?.label ||
    sectors.find((s) => s.slug === slug)?.title ||
    slug

  const selectSector = (slug: string | null) => {
    setSelectedSector(slug)
    setPage(1)
  }

  const hasFilters = Boolean(selectedSector || appliedSearch)
  const hasMore = page < totalPages

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SEOHead
        title={META_TITLE}
        description={META_DESCRIPTION}
        canonical="https://www.farcomarredi.it/blog"
        keywords={LOCAL_PAGE_KEYWORDS.blog}
        schema={[
          buildBlogIndexSchema(),
          buildBreadcrumbSchema([
            { name: "Home", item: "https://www.farcomarredi.it/" },
            { name: "Blog" },
          ]),
        ]}
      />

      {/* Header */}
      <header className="bg-[var(--foreground)] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <span className="mb-3 block pl-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#E69138]">
            Guide e consigli
          </span>
          <h1 className="mb-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            Blog Farcom Arredi
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Arredo contract, mobili su misura e progettazione interni per barbieri, negozi,
            uffici, bar, scuole e centri estetici.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12">
        {/* Filtri settore + ricerca */}
        <div className="mb-8 space-y-5">
          <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Filtra per settore">
            <button
              type="button"
              onClick={() => selectSector(null)}
              aria-pressed={selectedSector === null}
              className={`min-h-[40px] rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedSector === null
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
              }`}
            >
              Tutti
            </button>
            {sectorFilters.map((sector) => (
              <button
                key={sector.slug}
                type="button"
                onClick={() => selectSector(sector.slug)}
                aria-pressed={selectedSector === sector.slug}
                className={`min-h-[40px] rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedSector === sector.slug
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                }`}
              >
                {sector.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-md">
            <label htmlFor="blog-search" className="sr-only">
              Cerca nel blog
            </label>
            <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
              🔎
            </span>
            <input
              id="blog-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cerca per titolo o keyword…"
              className="min-h-[44px] w-full rounded-lg border border-[var(--border)] bg-white py-3 pl-10 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
            />
          </div>
        </div>

        {/* Risultati */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
            <p className="mb-4 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setPage(1)}
              className="min-h-[44px] rounded-lg bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              Riprova
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-white px-6 py-16 text-center">
            <p className="mb-2 font-display text-lg font-bold text-[var(--foreground)]">
              Nessun articolo trovato
            </p>
            <p className="mb-6 text-sm text-[var(--muted-foreground)]">
              {hasFilters
                ? "Prova con un'altra keyword o torna a tutti gli articoli."
                : "Gli articoli non sono ancora disponibili."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSector(null)
                  setSearchInput("")
                  setAppliedSearch("")
                  setPage(1)
                }}
                className="min-h-[44px] rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
              >
                Azzera i filtri
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <BlogCard
                  key={post._id}
                  post={post}
                  sectorLabel={sectorLabel(post.sectorSlug)}
                  eager={index < 3}
                />
              ))}
            </div>

            {/* Carica altri + paginazione di ripiego */}
            <div className="mt-12 flex flex-col items-center gap-6">
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loadingMore}
                  className="min-h-[44px] rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:brightness-95 disabled:opacity-60"
                >
                  {loadingMore ? "Caricamento…" : "Carica altri articoli"}
                </button>
              )}

              {totalPages > 1 && (
                <nav aria-label="Paginazione" className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="min-h-[40px] rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Precedente
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      type="button"
                      onClick={() => setPage(i + 1)}
                      aria-current={page === i + 1 ? "page" : undefined}
                      className={`min-h-[40px] rounded-lg px-4 py-2 text-sm transition-colors ${
                        page === i + 1
                          ? "bg-[var(--accent)] text-white"
                          : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="min-h-[40px] rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Successiva
                  </button>
                </nav>
              )}
            </div>
          </>
        )}

        {/* CTA */}
        <section className="mt-16 overflow-hidden rounded-xl bg-[var(--foreground)] px-6 py-10 sm:px-10 sm:py-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mb-2 font-display text-2xl font-bold text-white sm:text-3xl">
                Hai un locale da arredare?
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                Sopralluogo, progettazione 3D, produzione su misura e installazione:
                raccontaci il tuo spazio e ti rispondiamo con un preventivo.
              </p>
            </div>
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
                Contattaci
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
