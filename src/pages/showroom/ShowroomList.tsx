// Pagina pubblica: lista prodotti showroom
import { useEffect, useMemo, useState } from "react"
import ProductCard from "../../components/showroom/ProductCard"
import ProductFilters, {
  defaultPublicFilters,
  type PublicFilterState,
} from "../../components/showroom/ProductFilters"
import {
  computeEffectivePrice,
  getOffers,
  getProducts,
  type Offer,
  type Product,
} from "../../services/showroomApi"

export default function ShowroomList() {
  const [products, setProducts] = useState<Product[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [filters, setFilters] = useState<PublicFilterState>(defaultPublicFilters)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([getProducts(), getOffers()]).then(([p, o]) => {
      if (!alive) return
      setProducts(p.filter((x) => x.active))
      setOffers(o)
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
      if (filters.onlyOffers) {
        const eff = computeEffectivePrice(p, offers)
        if (eff.savings <= 0) return false
      }
      return true
    })
  }, [products, offers, filters])

  return (
    <main className="pt-24 pb-24 bg-[#FAFAF7] min-h-screen">
      <section className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-5 border border-[#B5965A]/30 bg-white">
            <span className="h-px w-8 bg-[#B5965A]" />
            <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-[#B5965A]">
              Catalogo
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[#1A1A18] leading-tight max-w-3xl">
            Showroom arredi professionali
          </h1>
          <p className="mt-5 text-base md:text-lg text-[#4A4A46] max-w-2xl leading-relaxed">
            Una selezione curata di arredi realizzati su misura per barberie, parrucchieri,
            uffici, scuole e attività speciali. Qualità artigianale e design italiano.
          </p>
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
              <div key={i} className="border border-[#DDD9D0] bg-white overflow-hidden">
                <div className="aspect-[4/3] bg-[#EAE7E0]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-[#EAE7E0] w-1/3" />
                  <div className="h-6 bg-[#EAE7E0] w-4/5" />
                  <div className="h-10 bg-[#EAE7E0]" />
                  <div className="h-6 bg-[#EAE7E0] w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-24 text-center border border-[#DDD9D0] bg-white">
            <div className="text-6xl mb-5 text-[#DDD9D0]">📭</div>
            <h3 className="font-display text-2xl font-light text-[#1A1A18] mb-2">
              Nessun prodotto trovato
            </h3>
            <p className="text-sm text-[#888580] mb-6">
              Prova a modificare i filtri o a rimuovere la ricerca.
            </p>
            <button
              onClick={() => setFilters(defaultPublicFilters)}
              className="text-sm font-medium px-6 py-2.5 bg-[#1B4332] text-white hover:bg-[#143326] transition-colors"
            >
              Reimposta filtri
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} offers={offers} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
