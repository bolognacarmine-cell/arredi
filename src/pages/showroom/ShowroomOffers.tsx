// Pagina pubblica: offerte showroom attive con i prodotti collegati
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  getOffers,
  getProducts,
  isOfferRunning,
  offerBadge,
  type Offer,
  type Product,
} from "../../services/showroomApi"
import { displaySector, displayFurnitureType } from "../../types/showroom"

const eur = (n: number) =>
  n.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })

const itDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

const offerPrice = (product: Product, offer: Offer) => {
  const raw =
    offer.discountType === "percent"
      ? product.basePrice * (1 - Math.min(100, Math.max(0, offer.discountValue)) / 100)
      : product.basePrice - offer.discountValue
  return Math.max(0, Math.round(raw * 100) / 100)
}

export default function ShowroomOffers() {
  const [products, setProducts] = useState<Product[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([getProducts(), getOffers()]).then(([p, o]) => {
      if (!alive) return
      setProducts(Array.isArray(p) ? p.filter((x) => x.active) : [])
      setOffers(Array.isArray(o) ? o : [])
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const running = useMemo(() => offers.filter((o) => isOfferRunning(o)), [offers])

  const productsById = useMemo(() => {
    const map = new Map<string, Product>()
    for (const p of products) map.set(p.id, p)
    return map
  }, [products])

  return (
    <main className="pt-24 pb-24 bg-[#FAFAF7] min-h-screen">
      <section className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16">
        <nav className="mb-8 text-xs text-[#888580] flex flex-wrap items-center gap-2">
          <Link to="/" className="hover:text-[#1B4332]">Home</Link>
          <span>/</span>
          <Link to="/showroom" className="hover:text-[#1B4332]">Showroom</Link>
          <span>/</span>
          <span className="text-[#4A4A46]">Offerte</span>
        </nav>

        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-5 border border-[#B5965A]/30 bg-white">
            <span className="h-px w-8 bg-[#B5965A]" />
            <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-[#B5965A]">
              Promozioni
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[#1A1A18] leading-tight max-w-3xl">
            Offerte attive
          </h1>
          <p className="mt-5 text-base md:text-lg text-[#4A4A46] max-w-2xl leading-relaxed">
            Promozioni in corso sugli arredi del nostro showroom, con i prodotti inclusi
            e il periodo di validità.
          </p>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border border-[#DDD9D0] bg-white p-6 space-y-4">
                <div className="h-6 bg-[#EAE7E0] w-1/3" />
                <div className="h-4 bg-[#EAE7E0] w-2/3" />
                <div className="h-24 bg-[#EAE7E0]" />
              </div>
            ))}
          </div>
        ) : running.length === 0 ? (
          <div className="py-24 text-center border border-[#DDD9D0] bg-white">
            <div className="text-6xl mb-5 text-[#DDD9D0]">🏷️</div>
            <h2 className="font-display text-2xl font-light text-[#1A1A18] mb-2">
              Nessuna offerta attiva
            </h2>
            <p className="text-sm text-[#888580] mb-6">
              Torna a trovarci: pubblichiamo regolarmente nuove promozioni.
            </p>
            <Link
              to="/showroom"
              className="inline-flex text-sm font-medium px-6 py-2.5 bg-[#1B4332] text-white hover:bg-[#143326] transition-colors"
            >
              Vai al catalogo
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {running.map((o) => {
              const linked = o.productIds
                .map((id) => productsById.get(id))
                .filter((p): p is Product => Boolean(p))
              return (
                <article key={o.id} className="border border-[#DDD9D0] bg-white">
                  <div className="p-6 border-b border-[#EAE7E0] flex flex-wrap items-start gap-4">
                    <span
                      className="text-sm font-bold px-3 py-1.5 text-white rounded"
                      style={{ background: o.discountType === "percent" ? "#B5965A" : "#1B4332" }}
                    >
                      {offerBadge(o)}
                    </span>
                    <div className="flex-1 min-w-[220px]">
                      <h2 className="font-display text-2xl font-medium text-[#1A1A18]">
                        {o.title}
                      </h2>
                      <p className="text-sm text-[#4A4A46] mt-1">{o.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 bg-[#EAE7E0] text-[#4A4A46]">
                          {displaySector(o.activitySector, o.activitySectorOther)}
                        </span>
                        <span className="text-[10px] text-[#888580]">
                          {displayFurnitureType(o.furnitureType, o.furnitureTypeOther)}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#888580] mt-2">
                        Valida dal {itDate(o.startDate)} al {itDate(o.endDate)}
                      </div>
                    </div>
                  </div>

                  {linked.length > 0 ? (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {linked.map((p) => (
                        <Link
                          key={p.id}
                          to={`/showroom/${p.slug}`}
                          className="group border border-[#DDD9D0] overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                          <div className="aspect-[4/3] bg-[#F7F5F0] overflow-hidden">
                            {p.images[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#DDD9D0] text-4xl">
                                🖼️
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-1.5">
                            <h3 className="font-display text-base font-medium text-[#1A1A18] group-hover:text-[#1B4332] transition-colors line-clamp-2">
                              {p.name}
                            </h3>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-[#888580] line-through">
                                {eur(p.basePrice)}
                              </span>
                              <span className="font-semibold text-[#1B4332]">
                                {eur(offerPrice(p, o))}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-sm text-[#888580]">
                      Nessun prodotto collegato a questa offerta.
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
