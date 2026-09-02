// Card prodotto per lista pubblica showroom (supporta campi Other)
import { Link } from "react-router-dom"
import type { Product, Offer } from "../../types/showroom"
import { computeEffectivePrice } from "../../services/showroomApi"
import { displayActivityCategory, displayFurnitureType } from "../../types/showroom"

interface Props {
  product: Product
  offers: Offer[]
}

const eur = (n: number) =>
  n.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })

export default function ProductCard({ product, offers }: Props) {
  const eff = computeEffectivePrice(product, offers)
  const activityLabel = displayActivityCategory(product.activityCategory, product.activityCategoryOther)
  const furnitureLabel = displayFurnitureType(product.furnitureType, product.furnitureTypeOther)

  return (
    <Link
      to={`/showroom/${product.slug}`}
      className="group block bg-white border border-[#DDD9D0] overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F5F0]">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#DDD9D0] text-4xl">
            🖼️
          </div>
        )}
        {eff.badge && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-md tracking-wide"
              style={{ background: product.discountPct ? "#B5965A" : "#1B4332" }}
            >
              {eff.badge}
            </span>
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
          <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 bg-[#EAE7E0] text-[#4A4A46]">
            {activityLabel}
          </span>
          <span className="text-[10px] text-[#888580]">
            {furnitureLabel}
          </span>
        </div>

        <h3 className="font-display text-lg font-medium text-[#1A1A18] group-hover:text-[#1B4332] transition-colors line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        <p className="text-sm text-[#4A4A46] line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        <div className="pt-2 flex items-end justify-between border-t border-[#EAE7E0]">
          <div>
            {eff.savings > 0 ? (
              <div>
                <div className="text-xs text-[#888580] line-through">
                  {eur(product.basePrice)}
                </div>
                <div className="font-semibold text-[#1B4332] text-lg leading-tight">
                  {eur(eff.finalPrice)}
                </div>
              </div>
            ) : (
              <div className="font-semibold text-[#1A1A18] text-lg">
                {eur(product.basePrice)}
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-[#B5965A] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Dettagli →
          </span>
        </div>
      </div>
    </Link>
  )
}
