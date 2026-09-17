// Pagina pubblica: lista prodotti showroom
import { useEffect, useMemo, useState } from "react"
import ProductCard from "../../components/showroom/ProductCard"
import ProductFilters, {
  defaultPublicFilters,
  type PublicFilterState,
} from "../../components/showroom/ProductFilters"
import SEOHead from "../../components/SEOHead"
import {
  computeEffectivePrice,
  getProducts,
  type Product,
} from "../../services/showroomApi"

export default function ShowroomList() {
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<PublicFilterState>(defaultPublicFilters)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    getProducts().then((p) => {
      if (!alive) return
      setProducts(Array.isArray(p) ? p.filter((x) => x.active) : [])
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
      return true
    })
  }, [products, filters])

  return (
    <main className="pt-24 pb-24 bg-[var(--background)] min-h-screen">
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
              "dayOfWeek": "Saturday",
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
      <section className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-5 border border-[var(--accent)]/30 bg-white">
            <span className="h-px w-8 bg-[var(--accent)]" />
            <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-[var(--accent)]">
              Catalogo
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[var(--foreground)] leading-tight max-w-3xl">
            Showroom Arredamento Campania
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--foreground)] max-w-2xl leading-relaxed">
            Showroom arredamento Campania a Macerata Campania: arredi professionali su misura per barberie, parrucchieri, uffici, scuole e attività speciali. Qualità artigianale Made in Italy con servizio in tutta Italia.
          </p>
          {products.some((p) => computeEffectivePrice(p).savings > 0) && (
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, onlyOffers: true }))}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 bg-[var(--accent)] text-white hover:bg-[var(--foreground)] transition-colors"
            >
              🏷️ Vedi i prodotti in promozione
            </button>
          )}
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
