import { Link } from "react-router-dom"

import { SECTORS } from "../data"
import { resolveImageUrl } from "../lib/cloudinary"
import { useHorzAutoStrip } from "../hooks/useHorzAutoStrip"

/**
 * Strip orizzontale delle card settori:
 * - full-bleed responsive
 * - scroll automatico continuo right→left (loop seamless) via transform
 * - swipe/drag unificato su mouse + touch (axis lock: X vs Y)
 * - tap/click senza drag apre il settore
 * - stesso comportamento su desktop e mobile (no scrollLeft programmatico)
 */
export default function SectorDragStrip() {
  const { viewportRef, trackRef, grabbing, handleCardClick, viewportProps } =
    useHorzAutoStrip({
      speedDesktop: 48,
      speedMobile: 48,
    })

  const items = [...SECTORS, ...SECTORS]

  return (
    <div className="-mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 xl:-mx-16 min-w-0">
      <div
        ref={viewportRef}
        role="region"
        aria-label="Scorri i settori"
        {...viewportProps}
        className={[
          "w-full min-w-0 overflow-hidden overscroll-x-contain",
          "pb-2",
          "select-none touch-pan-y",
          grabbing ? "cursor-grabbing" : "cursor-grab",
        ].join(" ")}
      >
        <div
          ref={trackRef}
          className={[
            "horz-scroll",
            "flex flex-row flex-nowrap w-max min-w-0 gap-3 sm:gap-4 md:gap-5 lg:gap-6",
            "px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16",
            "will-change-transform",
          ].join(" ")}
        >
          {items.map((s, i) => (
            <Link
              key={`${s.id}-${i}`}
              to={`/settori/${s.id}`}
              draggable={false}
              onClick={handleCardClick}
              className={[
                "group relative shrink-0 grow-0 overflow-hidden bg-white",
                "aspect-[3/4] flex flex-col justify-end",
                "p-4 sm:p-5 md:p-6 card-motion",
                "min-h-[44px]",
                "w-[min(78vw,20rem)] sm:w-[260px] md:w-[280px] lg:w-[300px]",
              ].join(" ")}
            >
              <div className="absolute inset-0">
                <img
                  src={resolveImageUrl(
                    {
                      src: s.heroImage,
                      publicId: s.heroImageCloudinaryPublicId ?? null,
                    },
                    {
                      width: 800,
                      height: 1067,
                      objectFit: "cover",
                      gravity: "auto",
                    },
                  )}
                  alt={s.label}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                  sizes="(max-width: 639px) 78vw, (max-width: 1023px) 260px, 300px"
                  draggable={false}
                  className="w-full h-full object-cover card-motion-media pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent sm:from-black/70 sm:via-black/20" />
              </div>
              <div className="relative z-10">
                <h3 className="font-display text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-1.5 md:mb-2 leading-snug">
                  {s.label}
                </h3>
                <p className="text-white/70 text-[11px] sm:text-xs leading-[1.65] sm:leading-[1.6] md:leading-relaxed line-clamp-2 mb-2 sm:mb-3 md:mb-4">
                  {s.description}
                </p>
                <span className="inline-flex items-center min-h-[36px] text-[#E69138] text-[10px] sm:text-xs font-medium tracking-wide card-motion-cta">
                  Scopri di più →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
