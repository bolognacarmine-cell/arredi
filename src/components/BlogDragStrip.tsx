import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { Link } from "react-router-dom"

import type { Post } from "../api/blogApi"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

/** Soglia in px oltre la quale il gesto conta come drag (non come click sul link). */
const DRAG_SLOP = 8
/** Velocità auto-scroll desktop (px/s). */
const AUTO_SPEED_DESKTOP = 40
/** Velocità auto-scroll mobile (px/s). */
const AUTO_SPEED_MOBILE = 28
/** Breakpoint allineato a Tailwind `sm`. */
const MOBILE_MQ = "(max-width: 639px)"
/** Dopo un drag/touch/hover, riprende lo scroll automatico. */
const RESUME_DELAY_MS = 2200

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
 * - scroll automatico continuo right→left (loop seamless)
 * - pause on hover (mouse) e durante drag/touch
 * - swipe/drag unificato mouse + touch (axis lock)
 * - tap/click senza drag apre il post
 */
export default function BlogDragStrip({ posts }: BlogDragStripProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    moved: false,
    pointerId: -1,
  })
  const axis = useRef<"none" | "x" | "y">("none")
  const suppressClick = useRef(false)
  const paused = useRef(false)
  const inView = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [grabbing, setGrabbing] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  const pauseAuto = () => {
    paused.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }

  const scheduleResume = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      paused.current = false
    }, RESUME_DELAY_MS)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el || typeof IntersectionObserver === "undefined") return

    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting && entry.intersectionRatio >= 0.1
      },
      { threshold: [0, 0.1, 0.25, 0.5] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reducedMotion || posts.length === 0) return

    const el = trackRef.current
    if (!el) return

    el.style.scrollBehavior = "auto"

    const mobileMq =
      typeof window !== "undefined" ? window.matchMedia(MOBILE_MQ) : null

    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (!paused.current && !drag.current.active && inView.current) {
        const half = el.scrollWidth / 2
        if (half > el.clientWidth * 0.5) {
          const speed = mobileMq?.matches
            ? AUTO_SPEED_MOBILE
            : AUTO_SPEED_DESKTOP
          const next = el.scrollLeft + speed * dt
          el.scrollLeft = next >= half ? next - half : next
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    }
  }, [reducedMotion, posts.length])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const onTouchMove = (e: TouchEvent) => {
      if (axis.current === "x") {
        e.preventDefault()
      }
    }

    el.addEventListener("touchmove", onTouchMove, { passive: false })
    return () => el.removeEventListener("touchmove", onTouchMove)
  }, [])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    const el = trackRef.current
    if (!el) return

    pauseAuto()
    axis.current = "none"
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      moved: false,
      pointerId: e.pointerId,
    }
    suppressClick.current = false
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    const el = trackRef.current
    if (!state.active || !el) return

    const dx = e.clientX - state.startX
    const dy = e.clientY - state.startY

    if (axis.current === "none") {
      if (Math.abs(dx) < DRAG_SLOP && Math.abs(dy) < DRAG_SLOP) return

      if (Math.abs(dx) >= Math.abs(dy)) {
        axis.current = "x"
        setGrabbing(true)
        try {
          el.setPointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
      } else {
        axis.current = "y"
        state.active = false
        scheduleResume()
        return
      }
    }

    if (axis.current !== "x") return

    state.moved = true
    el.scrollLeft = state.scrollLeft - dx
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state.active && axis.current !== "x") {
      axis.current = "none"
      return
    }

    const el = trackRef.current
    if (el && state.pointerId === e.pointerId) {
      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId)
        }
      } catch {
        /* ignore */
      }
    }

    suppressClick.current =
      state.moved ||
      (axis.current === "x" && Math.abs(e.clientX - state.startX) > DRAG_SLOP)
    state.active = false
    state.moved = false
    axis.current = "none"
    setGrabbing(false)
    scheduleResume()
  }

  if (posts.length === 0) return null

  // Duplica per loop seamless (come SectorDragStrip)
  const items = [...posts, ...posts]

  return (
    <div className="-mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 xl:-mx-16 min-w-0">
      <div
        ref={trackRef}
        role="region"
        aria-label="Scorri gli articoli del blog"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") pauseAuto()
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") scheduleResume()
        }}
        className={[
          "horz-scroll",
          "flex flex-row flex-nowrap w-full min-w-0 gap-3 sm:gap-4 md:gap-5 lg:gap-6",
          "overflow-x-auto overflow-y-hidden overscroll-x-contain",
          "px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 pb-2",
          "select-none touch-pan-y",
          "[scroll-behavior:auto] [-webkit-overflow-scrolling:touch]",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          grabbing ? "cursor-grabbing" : "cursor-grab",
        ].join(" ")}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((post, i) => (
          <Link
            key={`${post._id}-${i}`}
            to={`/blog/${post.slug}`}
            draggable={false}
            onClick={(e) => {
              if (suppressClick.current) {
                e.preventDefault()
                e.stopPropagation()
                suppressClick.current = false
              }
            }}
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
  )
}
