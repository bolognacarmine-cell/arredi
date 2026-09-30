import { Link } from "react-router-dom"

import type { Post } from "../api/blogApi"
import { useHorzAutoStrip } from "../hooks/useHorzAutoStrip"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatSector(slug: string) {
  return slug.replace(/-/g, " ")
}

type BlogDragStripProps = {
  posts: Post[]
}

/**
 * Strip orizzontale articoli blog (homepage):
 * - scroll automatico continuo right→left (loop seamless) via transform
 * - pause on hover (mouse) e durante drag/touch
 * - swipe/drag unificato mouse + touch (axis lock)
 * - tap/click senza drag apre il post
 * - stesso comportamento su desktop e mobile
 */
export default function BlogDragStrip({ posts }: BlogDragStripProps) {
  const { viewportRef, trackRef, grabbing, handleCardClick, viewportProps } =
    useHorzAutoStrip({
      speedDesktop: 40,
      speedMobile: 40,
      enabled: posts.length > 0,
      pauseOnHover: true,
    })

  if (posts.length === 0) return null

  const items = [...posts, ...posts]

  return (
    <div className="-mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 xl:-mx-16 min-w-0">
      <div
        ref={viewportRef}
        role="region"
        aria-label="Scorri gli articoli del blog"
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
          {items.map((post, i) => (
            <Link
              key={`${post._id}-${i}`}
              to={`/blog/${post.slug}`}
              draggable={false}
              onClick={handleCardClick}
              className={[
                "group shrink-0 grow-0 overflow-hidden bg-white",
                "flex flex-col card-motion",
                "w-[min(80vw,20rem)] sm:w-[280px] md:w-[300px] lg:w-[320px]",
              ].join(" ")}
            >
              {post.coverImage && (
                <div className="aspect-[16/10] overflow-hidden shrink-0">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    width="1600"
                    height="1000"
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                    sizes="(max-width: 639px) 80vw, (max-width: 1023px) 280px, 320px"
                    draggable={false}
                    className="w-full h-full object-cover card-motion-media pointer-events-none"
                  />
                </div>
              )}
              <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-medium text-[#E69138] uppercase tracking-wide">
                    {formatSector(post.sectorSlug)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#6B7280]">•</span>
                  <span className="text-[10px] sm:text-xs text-[#6B7280]">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>
                <h3 className="font-display text-base sm:text-lg md:text-xl font-bold text-[#1A1A2E] mb-2 sm:mb-3 leading-snug line-clamp-2 group-hover:text-[#E69138] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[#6B7280] text-[11px] sm:text-xs leading-[1.65] sm:leading-relaxed line-clamp-2 mb-3 sm:mb-4 flex-1">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center min-h-[32px] sm:min-h-[36px] text-[#E69138] text-[10px] sm:text-xs font-medium tracking-wide card-motion-cta">
                  Leggi articolo →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
