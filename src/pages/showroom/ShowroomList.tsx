// Pagina pubblica: lista prodotti showroom
import { useEffect, useMemo, useState } from "react"
import ProductCard from "../../components/showroom/ProductCard"
import ProductFilters, {
  defaultPublicFilters,
  type PublicFilterState,
} from "../../components/showroom/ProductFilters"
import SEOHead from "../../components/SEOHead"
import HeroBackgroundVideo from "../../components/HeroBackgroundVideo"
import {
  computeEffectivePrice,
  getProducts,
  type Product,
} from "../../services/showroomApi"

export default function ShowroomList() {
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<PublicFilterState>(defaultPublicFilters)
  const [loading, setLoading] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    let alive = true
    getProducts().then((p) => {
      if (!alive) return
      setProducts(Array.isArray(p) ? p : [])
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const visible = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q))
        return false
      if (filters.sector !== "all" && p.activitySector !== filters.sector) return false
      if (filters.furniture !== "all" && p.furnitureType !== filters.furniture) return false
      if (filters.onlyOffers && computeEffectivePrice(p).savings <= 0) return false
      // Hide sold products unless showSoldInFrontend is true (safety filter)
      if (p.isSold && !p.showSoldInFrontend) return false
      return true
    })
  }, [products, filters])

  return (
    <main className="min-h-screen">
      <SEOHead
        title="Showroom Arredamento Campania - Arredi Professionali Farcom Srl"
        description="Showroom arredamento Campania: arredi professionali su misura per barberie, parrucchieri, uffici, scuole. Visita il nostro showroom a Macerata Campania o richiedi un preventivo in tutta Italia."
        canonical="https://arredi.onrender.com/showroom"
        schema={{
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Farcom Srl Showroom",
          "description": "Showroom arredamento Campania con arredi professionali su misura per barberie, parrucchieri, uffici, scuole e attività speciali.",
          "url": "https://arredi.onrender.com/showroom",
          "telephone": "+39 0823 694427",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Via P. Vertaldi, 27",
            "addressLocality": "Macerata Campania",
            "addressRegion": "CE",
            "postalCode": "81050",
            "addressCountry": "IT"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 41.10,
            "longitude": 14.25
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "13:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "15:00",
              "closes": "19:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Saturday"],
              "opens": "09:00",
              "closes": "13:00"
            }
          ],
          "areaServed": [
            {
              "@type": "AdministrativeArea",
              "name": "Campania"
            },
            {
              "@type": "Country",
              "name": "Italia"
            }
          ]
        }}
      />

      {/* Hero Video Section */}
      <section className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
        {!prefersReducedMotion ? (
          <HeroBackgroundVideo
            basePath="/videos/showroom"
            priority={true}
            isMuted={true}
            fallbackImg="https://images.unsplash.com/photo-1547609434-b732edfee020?w=1920&h=1080&fit=crop&auto=format"
          />
        ) : (
          <div className="absolute inset-0 bg-[#1A1A2E]">
            <img
              src="https://images.unsplash.com/photo-1547609434-b732edfee020?w=1920&h=1080&fit=crop&auto=format"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 text-center relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-6 border border-[var(--accent)]/30 bg-white/90 backdrop-blur-sm">
              <span className="h-px w-8 bg-[var(--accent)]" />
              <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-[var(--accent)]">
                Catalogo
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight max-w-4xl mb-6 drop-shadow-lg">
              Showroom Arredamento Campania
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed mb-8 drop-shadow-md">
              Showroom arredamento Campania a Macerata Campania: arredi professionali su misura per barberie, parrucchieri, uffici, scuole e attività speciali. Qualità artigianale Made in Italy con servizio in tutta Italia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#products"
                className="inline-flex items-center justify-center px-8 py-3 bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--foreground)] transition-colors shadow-lg"
              >
                Scopri i prodotti
              </a>
              {products.some((p) => computeEffectivePrice(p).savings > 0) && (
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, onlyOffers: true }))}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/90 backdrop-blur-sm text-[var(--foreground)] text-sm font-medium hover:bg-white transition-colors shadow-lg"
                >
                  🏷️ Vedi le promozioni
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 pointer-events-none" />
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-5 border border-[var(--accent)]/30 bg-white">
            <span className="h-px w-8 bg-[var(--accent)]" />
            <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-[var(--accent)]">
              Catalogo
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)] leading-tight max-w-3xl">
            I Nostri Prodotti
          </h2>
        </div>

        <ProductFilters
          filters={filters}
          onChange={setFilters}
          matching={visible.length}
          total={products.length}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-[var(--border)] bg-white overflow-hidden">
                <div className="aspect-[4/3] bg-[var(--muted)]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-[var(--muted)] w-1/3" />
                  <div className="h-6 bg-[var(--muted)] w-4/5" />
                  <div className="h-10 bg-[var(--muted)]" />
                  <div className="h-6 bg-[var(--muted)] w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-24 text-center border border-[var(--border)] bg-white">
            <div className="text-6xl mb-5 text-[var(--border)]">📭</div>
            <h3 className="font-display text-2xl font-light text-[var(--foreground)] mb-2">
              Nessun prodotto trovato
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Prova a modificare i filtri o a rimuovere la ricerca.
            </p>
            <button
              onClick={() => setFilters(defaultPublicFilters)}
              className="text-sm font-medium px-6 py-2.5 bg-[var(--primary)] text-white hover:bg-[var(--foreground)] transition-colors"
            >
              Reimposta filtri
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
