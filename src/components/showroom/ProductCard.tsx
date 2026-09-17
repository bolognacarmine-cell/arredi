// Card prodotto per lista pubblica showroom (activitySector + campi Other)
import { Link } from "react-router-dom"
import type { Product } from "../../services/showroomApi"
import { activePromo, computeEffectivePrice } from "../../services/showroomApi"
import { displaySector, displayFurnitureType } from "../../types/showroom"
import PromoCountdown from "./PromoCountdown"

interface Props {
  product: Product
}

const eur = (n: number) =>
  n.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })

export default function ProductCard({ product }: Props) {
  const eff = computeEffectivePrice(product)
  const promo = activePromo(product)
  const sectorLabel = displaySector(product.activitySector, product.activitySectorOther)
  const furnitureLabel = displayFurnitureType(product.furnitureType, product.furnitureTypeOther)

  return (
    <Link
      to={`/showroom/${product.slug}`}
      className="group block bg-white border border-[var(--border)] overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--background)]">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--border)] text-4xl">
            🖼️
          </div>
        )}
        {eff.badge && (
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-md tracking-wide bg-[var(--accent)]">
              {eff.badge}
            </span>
            {promo && (
              <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold text-white bg-[var(--primary)] shadow-md">
                Promo
              </span>
            )}
          </div>
        )}
        {!product.active && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-xs uppercase tracking-widest font-semibold px-3 py-1 border border-white/40">
              Non disponibile
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 bg-[var(--muted)] text-[var(--foreground)]">
            {sectorLabel}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)]">
            {furnitureLabel}
          </span>
        </div>

        <h3 className="font-display text-lg font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        <p className="text-sm text-[var(--foreground)] line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        {promo?.text && (
          <p className="text-xs font-medium text-[var(--accent)] line-clamp-1">{promo.text}</p>
        )}
        {promo?.endDate && <PromoCountdown endDate={promo.endDate} className="text-xs" />}

        <div className="pt-2 flex items-end justify-between border-t border-[var(--muted)]">
          <div>
            {eff.savings > 0 ? (
              <div>
                <div className="text-xs text-[var(--muted-foreground)] line-through">
                  {eur(product.basePrice)}
                </div>
                <div className="font-semibold text-[var(--primary)] text-lg leading-tight">
                  {eur(eff.finalPrice)}
                </div>
              </div>
            ) : (
              <div className="font-semibold text-[var(--foreground)] text-lg">
                {eur(product.basePrice)}
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-[var(--accent)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Dettagli →
          </span>
        </div>
      </div>
    </Link>
  )
}
