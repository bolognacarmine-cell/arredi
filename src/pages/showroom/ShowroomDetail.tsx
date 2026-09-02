// Pagina pubblica: dettaglio prodotto showroom
import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  computeEffectivePrice,
  getOffers,
  getProductBySlug,
  offerBadge,
  type Offer,
  type Product,
} from "../../services/showroomApi"
import {
  displaySector,
  displayFurnitureType,
} from "../../types/showroom"

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

export default function ShowroomDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)
  const [offers, setOffers] = useState<Offer[]>([])
  const [imgIdx, setImgIdx] = useState(0)
  const [infoOpen, setInfoOpen] = useState(false)
  const [infoForm, setInfoForm] = useState({ nome: "", email: "", telefono: "", messaggio: "" })

  useEffect(() => {
    setImgIdx(0)
    if (!slug) {
      setProduct(null)
      return
    }
    let alive = true
    Promise.all([getProductBySlug(slug), getOffers()]).then(([p, o]) => {
      if (!alive) return
      setProduct(p)
      setOffers(o)
    })
    return () => {
      alive = false
    }
  }, [slug])

  const eff = useMemo(
    () => (product ? computeEffectivePrice(product, offers) : null),
    [product, offers],
  )

  const linkedOffers = useMemo(() => {
    if (!product) return []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const t = today.getTime()
    return offers.filter((o) => {
      if (!o.active) return false
      if (!o.productIds.includes(product.id)) return false
      const s = new Date(o.startDate).getTime()
      const e = new Date(o.endDate + "T23:59:59").getTime()
      return t >= s && t <= e
    })
  }, [offers, product])

  if (product === undefined) {
    return (
      <main className="pt-28 pb-24 bg-[#FAFAF7] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16">
          <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="aspect-[4/3] bg-[#EAE7E0]" />
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-[#EAE7E0]" />
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <div className="h-4 bg-[#EAE7E0] w-1/4" />
                <div className="h-12 bg-[#EAE7E0] w-3/4" />
                <div className="h-28 bg-[#EAE7E0]" />
                <div className="h-12 bg-[#EAE7E0] w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="pt-28 pb-24 bg-[#FAFAF7] min-h-screen">
        <div className="max-w-3xl mx-auto px-6 md:px-8 lg:px-16 text-center py-24">
          <div className="text-6xl mb-5 text-[#DDD9D0]">🔍</div>
          <h1 className="font-display text-3xl font-light text-[#1A1A18] mb-3">
            Prodotto non trovato
          </h1>
          <p className="text-[#4A4A46] mb-8">
            Il prodotto che stai cercando non è disponibile o è stato rimosso.
          </p>
          <Link
            to="/showroom"
            className="inline-flex px-6 py-3 bg-[#1B4332] text-white text-sm font-medium hover:bg-[#143326] transition-colors"
          >
            ← Torna allo Showroom
          </Link>
        </div>
      </main>
    )
  }

  const p = product

  return (
    <main className="pt-24 pb-24 bg-[#FAFAF7] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16">
        <nav className="mb-8 text-xs text-[#888580] flex flex-wrap items-center gap-2">
          <Link to="/" className="hover:text-[#1B4332]">Home</Link>
          <span>/</span>
          <Link to="/showroom" className="hover:text-[#1B4332]">Showroom</Link>
          <span>/</span>
          <span className="text-[#4A4A46] truncate">{p.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden border border-[#DDD9D0] bg-white">
              {p.images[imgIdx] ? (
                <img
                  src={p.images[imgIdx]}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#DDD9D0] text-7xl">🖼️</div>
              )}
              {eff?.badge && (
                <div className="absolute top-4 left-4">
                  <span
                    className="px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-lg tracking-wide"
                    style={{ background: p.discountPct ? "#B5965A" : "#1B4332" }}
                  >
                    {eff.badge}
                  </span>
                </div>
              )}
              {p.images.length > 1 && (
                <>
                  <button
                    aria-label="Immagine precedente"
                    onClick={() => setImgIdx((i) => (i - 1 + p.images.length) % p.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1A1A18] shadow-lg transition-colors flex items-center justify-center text-xl"
                  >
                    ‹
                  </button>
                  <button
                    aria-label="Immagine successiva"
                    onClick={() => setImgIdx((i) => (i + 1) % p.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1A1A18] shadow-lg transition-colors flex items-center justify-center text-xl"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {p.images.length > 1 && (
              <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
                {p.images.map((url, i) => (
                  <button
                    key={url.slice(-30) + i}
                    onClick={() => setImgIdx(i)}
                    className={`aspect-square overflow-hidden border transition-all ${
                      i === imgIdx
                        ? "border-[#1B4332] ring-2 ring-[#1B4332]/20"
                        : "border-[#DDD9D0] hover:border-[#888580]"
                    } bg-white`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-7">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-3 px-4 py-1.5 border border-[#B5965A]/30 bg-white">
                  <span className="h-px w-6 bg-[#B5965A]" />
                  <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[#B5965A]">
                    {displaySector(p.activitySector, p.activitySectorOther)}
                  </span>
                </span>
                <span className="text-xs text-[#888580] px-2.5 py-1 bg-[#EAE7E0]">
                  {displayFurnitureType(p.furnitureType, p.furnitureTypeOther)}
                </span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-light text-[#1A1A18] leading-tight">
                {p.name}
              </h1>

              <p className="text-[#4A4A46] leading-relaxed text-base md:text-lg">
                {p.description}
              </p>
            </div>

            <div className="py-6 border-y border-[#DDD9D0] flex flex-wrap items-end justify-between gap-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#888580] mb-1.5">Prezzo</div>
                {eff && eff.savings > 0 ? (
                  <div className="flex items-end gap-3">
                    <span className="text-sm line-through text-[#888580]">
                      {eur(p.basePrice)}
                    </span>
                    <span className="font-display text-3xl font-semibold text-[#1B4332]">
                      {eur(eff.finalPrice)}
                    </span>
                  </div>
                ) : (
                  <span className="font-display text-3xl font-semibold text-[#1A1A18]">
                    {eur(p.basePrice)}
                  </span>
                )}
                {eff?.savings ? (
                  <div className="text-xs text-[#B5965A] mt-1 font-medium">
                    Risparmi {eur(eff.savings)}
                  </div>
                ) : null}
              </div>
              <div className="text-right text-xs text-[#888580]">
                <div>Codice: <span className="font-mono text-[#4A4A46]">{p.sku}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-4 border border-[#DDD9D0] bg-white">
                <div className="text-[10px] uppercase tracking-wider text-[#888580] mb-1.5">Settore</div>
                <div className="font-medium text-[#1A1A18]">{displaySector(p.activitySector, p.activitySectorOther)}</div>
              </div>
              <div className="p-4 border border-[#DDD9D0] bg-white">
                <div className="text-[10px] uppercase tracking-wider text-[#888580] mb-1.5">Tipologia</div>
                <div className="font-medium text-[#1A1A18]">{displayFurnitureType(p.furnitureType, p.furnitureTypeOther)}</div>
              </div>
            </div>

            {linkedOffers.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider text-[#888580]">
                  Offerte collegate attive
                </div>
                {linkedOffers.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 border border-[#B5965A]/40 bg-gradient-to-r from-[#B5965A]/5 to-transparent"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold px-2.5 py-1 text-white rounded"
                        style={{ background: o.discountType === "percent" ? "#B5965A" : "#1B4332" }}
                      >
                        {offerBadge(o)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#1A1A18]">{o.title}</div>
                        <div className="text-xs text-[#4A4A46] mt-0.5 line-clamp-2">
                          {o.description}
                        </div>
                        <div className="text-[11px] text-[#888580] mt-1.5">
                          Valida dal {itDate(o.startDate)} al {itDate(o.endDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setInfoOpen(true)}
                className="w-full py-3.5 bg-[#B5965A] text-white font-medium text-sm hover:bg-[#9A7F48] transition-colors tracking-wide flex items-center justify-center gap-2"
              >
                📨 Richiedi informazioni per questo prodotto
              </button>
              <Link
                to="/preventivo"
                className="w-full block text-center py-3.5 border-2 border-[#1B4332] text-[#1B4332] font-medium text-sm hover:bg-[#1B4332] hover:text-white transition-colors tracking-wide"
              >
                🛠 Richiedi un preventivo completo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {infoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in"
          onMouseDown={(e) => e.target === e.currentTarget && setInfoOpen(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert(
                "Grazie! Ti ricontatteremo al più presto per il prodotto: " +
                  p.name,
              )
              setInfoOpen(false)
              setInfoForm({ nome: "", email: "", telefono: "", messaggio: "" })
            }}
            className="bg-white w-full max-w-lg border border-[#DDD9D0] shadow-2xl flex flex-col animate-slide-up"
          >
            <div className="px-6 py-4 border-b border-[#EAE7E0] flex items-center justify-between">
              <h3 className="font-display text-xl font-medium text-[#1A1A18]">
                Richiesta informazioni
              </h3>
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="text-sm text-[#888580] hover:text-[#1A1A18]"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="p-3 bg-[#F7F5F0] border border-[#EAE7E0] text-xs text-[#4A4A46]">
                Stai richiedendo info per:{" "}
                <span className="font-medium text-[#1A1A18]">{p.name}</span>{" "}
                <span className="font-mono text-[#888580]">({p.sku})</span>
              </div>
              {[
                { k: "nome", l: "Nome e cognome *", t: "text" },
                { k: "email", l: "Email *", t: "email" },
                { k: "telefono", l: "Telefono", t: "tel" },
              ].map((f) => (
                <div key={f.k}>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                    {f.l}
                  </label>
                  <input
                    required={f.k !== "telefono"}
                    type={f.t}
                    value={(infoForm as any)[f.k]}
                    onChange={(e) =>
                      setInfoForm((s) => ({ ...s, [f.k]: e.target.value }))
                    }
                    className="w-full border border-[#DDD9D0] bg-[#FAFAF7] px-3 py-2.5 text-sm focus:border-[#1B4332] focus:outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                  Messaggio
                </label>
                <textarea
                  rows={3}
                  value={infoForm.messaggio}
                  onChange={(e) => setInfoForm((s) => ({ ...s, messaggio: e.target.value }))}
                  placeholder="Note, quantità, personalizzazioni…"
                  className="w-full border border-[#DDD9D0] bg-[#FAFAF7] px-3 py-2.5 text-sm focus:border-[#1B4332] focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#EAE7E0] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="px-5 py-2.5 text-sm border border-[#DDD9D0] hover:bg-[#F7F5F0]"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm bg-[#1B4332] text-white font-medium hover:bg-[#143326]"
              >
                Invia richiesta
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
