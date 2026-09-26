// Pagina pubblica: dettaglio prodotto showroom
import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  activePromo,
  computeEffectivePrice,
  getProductBySlug,
  type Product,
} from "../../services/showroomApi"
import {
  displaySector,
  displayFurnitureType,
} from "../../types/showroom"
import ImageCarousel from "../../components/ImageCarousel"
import PromoCountdown from "../../components/showroom/PromoCountdown"
import SEOHead from "../../components/SEOHead"

const eur = (n: number) =>
  n.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })

const formatPrice = (n: number) => {
  if (n === 0) return "Prezzo su richiesta"
  return eur(n)
}

const itDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

// Generate Product schema
const getProductSchema = (product: Product, effectivePrice: ReturnType<typeof computeEffectivePrice>) => {
  const finalPrice = effectivePrice?.finalPrice || product.basePrice
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images,
    "sku": product.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": "Farcom"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Farcom Srl"
    },
    "offers": {
      "@type": "Offer",
      "price": finalPrice,
      "priceCurrency": "EUR",
      "availability": !product.isSold ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `https://arredi.onrender.com/showroom/${product.slug}`,
      "seller": {
        "@type": "Organization",
        "name": "Farcom Srl",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Via P. Vertaldi, 27",
          "addressLocality": "Macerata Campania",
          "addressRegion": "CE",
          "postalCode": "81050",
          "addressCountry": "IT"
        }
      }
    },
    "category": displaySector(product.activitySector, product.activitySectorOther),
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Settore",
        "value": displaySector(product.activitySector, product.activitySectorOther)
      },
      {
        "@type": "PropertyValue",
        "name": "Tipologia",
        "value": displayFurnitureType(product.furnitureType, product.furnitureTypeOther)
      }
    ]
  }
}

export default function ShowroomDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)
  const [infoOpen, setInfoOpen] = useState(false)
  const [infoForm, setInfoForm] = useState({ nome: "", email: "", telefono: "", messaggio: "" })

  useEffect(() => {
    if (!slug) {
      setProduct(null)
      return
    }
    let alive = true
    getProductBySlug(slug).then((p) => {
      if (!alive) return
      setProduct(p)
    })
    return () => {
      alive = false
    }
  }, [slug])

  const eff = useMemo(
    () => (product ? computeEffectivePrice(product) : null),
    [product],
  )

  const promo = useMemo(() => (product ? activePromo(product) : null), [product])

  if (product === undefined) {
    return (
      <main className="pt-28 pb-24 bg-[var(--background)] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16">
          <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="aspect-[4/3] bg-[var(--muted)]" />
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-[var(--muted)]" />
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <div className="h-4 bg-[var(--muted)] w-1/4" />
                <div className="h-12 bg-[var(--muted)] w-3/4" />
                <div className="h-28 bg-[var(--muted)]" />
                <div className="h-12 bg-[var(--muted)] w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="pt-28 pb-24 bg-[var(--background)] min-h-screen">
        <div className="max-w-3xl mx-auto px-6 md:px-8 lg:px-16 text-center py-24">
          <div className="text-6xl mb-5 text-[var(--border)]">🔍</div>
          <h1 className="font-display text-3xl font-light text-[var(--foreground)] mb-3">
            Prodotto non trovato
          </h1>
          <p className="text-[var(--foreground)] mb-8">
            Il prodotto che stai cercando non è disponibile o è stato rimosso.
          </p>
          <Link
            to="/showroom"
            className="inline-flex px-6 py-3 bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--foreground)] transition-colors"
          >
            ← Torna allo Showroom
          </Link>
        </div>
      </main>
    )
  }

  // Safety check: hide sold products that should not be shown in frontend
  if (product.isSold && !product.showSoldInFrontend) {
    return (
      <main className="pt-28 pb-24 bg-[var(--background)] min-h-screen">
        <div className="max-w-3xl mx-auto px-6 md:px-8 lg:px-16 text-center py-24">
          <div className="text-6xl mb-5 text-[var(--border)]">🔒</div>
          <h1 className="font-display text-3xl font-light text-[var(--foreground)] mb-3">
            Prodotto non disponibile
          </h1>
          <p className="text-[var(--foreground)] mb-8">
            Questo prodotto non è più disponibile al pubblico.
          </p>
          <Link
            to="/showroom"
            className="inline-flex px-6 py-3 bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--foreground)] transition-colors"
          >
            ← Torna allo Showroom
          </Link>
        </div>
      </main>
    )
  }

  const p = product

  return (
    <main className="pt-24 pb-24 bg-[var(--background)] min-h-screen">
      <SEOHead
        title={`${p.name} - Arredamento ${displaySector(p.activitySector, p.activitySectorOther)} | Farcom`}
        description={`${p.description} Scopri questo arredo professionale ${displaySector(p.activitySector, p.activitySectorOther)} nel showroom Farcom a Macerata Campania. Qualità artigianale Made in Italy con servizio in tutta Italia.`}
        canonical={`https://arredi.onrender.com/showroom/${p.slug}`}
        schema={getProductSchema(p, eff)}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16">
        <nav className="mb-8 text-xs text-[var(--muted-foreground)] flex flex-wrap items-center gap-2">
          <Link to="/" className="hover:text-[var(--primary)]">Home</Link>
          <span>/</span>
          <Link to="/showroom" className="hover:text-[var(--primary)]">Showroom</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] truncate">{p.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <ImageCarousel
            images={p.images}
            alt={`${p.name} - Arredamento ${displaySector(p.activitySector, p.activitySectorOther)} Made in Italy`}
            maxHeightClass="max-h-[60vh]"
            overlay={
              <>
                {eff?.badge ? (
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-lg tracking-wide bg-[var(--accent)]">
                    {eff.badge}
                  </span>
                ) : null}
                {p.isSold && p.showSoldInFrontend && (
                  <div
                    className="px-4 py-2 sm:px-5 sm:py-3 rounded text-xs sm:text-sm font-bold text-white shadow-2xl tracking-widest border-2 border-white/20 transform rotate-[-2deg]"
                    role="status"
                    aria-label="Prodotto venduto"
                    style={{
                      backgroundColor: '#4a2c2a',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    VENDUTO
                  </div>
                )}
              </>
            }
          />

          <div className="space-y-7">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-3 px-4 py-1.5 border border-[var(--accent)]/30 bg-white">
                  <span className="h-px w-6 bg-[var(--accent)]" />
                  <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--accent)]">
                    {displaySector(p.activitySector, p.activitySectorOther)}
                  </span>
                </span>
                <span className="text-xs text-[var(--muted-foreground)] px-2.5 py-1 bg-[var(--muted)]">
                  {displayFurnitureType(p.furnitureType, p.furnitureTypeOther)}
                </span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)] leading-tight">
                {p.name}
              </h1>

              <p className="text-[var(--foreground)] leading-relaxed text-base md:text-lg">
                {p.description}
              </p>
            </div>

            <div className="py-6 border-y border-[var(--border)] flex flex-wrap items-end justify-between gap-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Prezzo</div>
                {eff && eff.savings > 0 ? (
                  <div className="flex items-end gap-3">
                    <span className="text-sm line-through text-[var(--muted-foreground)]">
                      {formatPrice(p.basePrice)}
                    </span>
                    <span className="font-display text-3xl font-semibold text-[var(--primary)]">
                      {formatPrice(eff.finalPrice)}
                    </span>
                  </div>
                ) : (
                  <span className="font-display text-3xl font-semibold text-[var(--foreground)]">
                    {formatPrice(p.basePrice)}
                  </span>
                )}
                {eff?.savings ? (
                  <div className="text-xs text-[var(--accent)] mt-1 font-medium">
                    Risparmi {formatPrice(eff.savings)}
                  </div>
                ) : null}
              </div>
              <div className="text-right text-xs text-[var(--muted-foreground)]">
                <div>Codice: <span className="font-mono text-[var(--foreground)]">{p.sku || p.id}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-4 border border-[var(--border)] bg-white">
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Settore</div>
                <div className="font-medium text-[var(--foreground)]">{displaySector(p.activitySector, p.activitySectorOther)}</div>
              </div>
              <div className="p-4 border border-[var(--border)] bg-white">
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Tipologia</div>
                <div className="font-medium text-[var(--foreground)]">{displayFurnitureType(p.furnitureType, p.furnitureTypeOther)}</div>
              </div>
            </div>

            {promo && (
              <div className="p-4 border border-[var(--accent)]/40 bg-gradient-to-r from-[var(--accent)]/5 to-transparent">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 text-white rounded bg-[var(--accent)]">
                    {promo.badge}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="font-medium text-[var(--foreground)]">
                      {promo.text || "Promozione attiva"}
                    </div>
                    {promo.endDate && (
                      <div className="text-[11px] text-[var(--muted-foreground)]">
                        {promo.startDate
                          ? `Valida dal ${itDate(promo.startDate)} al ${itDate(promo.endDate)}`
                          : `Valida fino al ${itDate(promo.endDate)}`}
                      </div>
                    )}
                    {promo.endDate && <PromoCountdown endDate={promo.endDate} className="text-xs" />}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              {!p.isSold ? (
                <button
                  onClick={() => setInfoOpen(true)}
                  className="w-full py-3.5 bg-[var(--accent)] text-white font-medium text-sm hover:bg-[var(--foreground)] transition-colors tracking-wide flex items-center justify-center gap-2"
                >
                  {promo
                    ? "🏷️ Approfitta dell'offerta"
                    : "📨 Richiedi informazioni per questo prodotto"}
                </button>
              ) : (
                <div className="w-full py-3.5 bg-[var(--muted)] text-[var(--muted-foreground)] font-medium text-sm text-center tracking-wide flex items-center justify-center gap-2 border border-[var(--border)]">
                  <span>⚪ Prodotto venduto</span>
                </div>
              )}
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
              const telefonoPulito = infoForm.telefono.trim()
              const telefonoMostrato = telefonoPulito || "Non indicato"
              const message = `Richiesta informazioni prodotto dal sito Arredi

Prodotto: ${p.name}
Codice: ${p.sku || p.id}

Nome: ${infoForm.nome}
Email: ${infoForm.email}
Telefono: ${telefonoMostrato}

Messaggio:
${infoForm.messaggio}`
              const encodedMessage = encodeURIComponent(message)
              const whatsappUrl = `https://wa.me/393294576079?text=${encodedMessage}`
              window.open(whatsappUrl, "_blank", "noopener,noreferrer")
            }}
            className="bg-white w-full max-w-lg border border-[var(--border)] shadow-2xl flex flex-col animate-slide-up"
          >
            <div className="px-6 py-4 border-b border-[var(--muted)] flex items-center justify-between">
              <h3 className="font-display text-xl font-medium text-[var(--foreground)]">
                Richiesta informazioni
              </h3>
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="p-3 bg-[var(--background)] border border-[var(--muted)] text-xs text-[var(--foreground)]">
                Stai richiedendo info per:{" "}
                <span className="font-medium text-[var(--foreground)]">{p.name}</span>{" "}
                <span className="font-mono text-[var(--muted-foreground)]">({p.sku || p.id})</span>
              </div>
              {[
                { k: "nome", l: "Nome e cognome *", t: "text" },
                { k: "email", l: "Email *", t: "email" },
                { k: "telefono", l: "Telefono", t: "tel" },
              ].map((f) => (
                <div key={f.k}>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    {f.l}
                  </label>
                  <input
                    required={f.k !== "telefono"}
                    type={f.t}
                    value={(infoForm as any)[f.k]}
                    onChange={(e) =>
                      setInfoForm((s) => ({ ...s, [f.k]: e.target.value }))
                    }
                    className="w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  Messaggio
                </label>
                <textarea
                  rows={3}
                  value={infoForm.messaggio}
                  onChange={(e) => setInfoForm((s) => ({ ...s, messaggio: e.target.value }))}
                  placeholder="Note, quantità, personalizzazioni…"
                  className="w-full border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--muted)] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="px-5 py-2.5 text-sm border border-[var(--border)] hover:bg-[var(--background)]"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm bg-[var(--primary)] text-white font-medium hover:bg-[var(--foreground)]"
              >
                Contattaci su WhatsApp
              </button>
            </div>
            <div className="px-6 pb-4 text-xs text-[var(--muted-foreground)]">
              I dati inseriti saranno utilizzati esclusivamente per ricontattarti in merito alla tua richiesta. Consulta la nostra <a href="/privacy" className="text-[var(--primary)] underline">Informativa privacy</a>.
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
