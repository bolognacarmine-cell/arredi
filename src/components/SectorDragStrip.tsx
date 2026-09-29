import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { Link } from "react-router-dom"

import { SECTORS } from "../data"
import { resolveImageUrl } from "../lib/cloudinary"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

/** Soglia in px oltre la quale il gesto conta come drag (non come click sul link). */
const DRAG_SLOP = 6
/** Velocità auto-scroll desktop (px/s) — abbastanza visibile. */
const AUTO_SPEED_DESKTOP = 48
/** Velocità auto-scroll mobile (px/s). */
const AUTO_SPEED_MOBILE = 32
/** Breakpoint allineato a Tailwind `sm`. */
const MOBILE_MQ = "(max-width: 639px)"
/** Dopo un drag/touch, riprende lo scroll automatico. */
const RESUME_DELAY_MS = 2000

/**
 * Strip orizzontale delle card settori:
 * - full-bleed responsive
 * - scroll automatico continuo right→left (loop seamless)
 * - desktop: click + trascina; mobile: swipe nativo
 * - tap/click senza drag apre il settore
 */
export default function SectorDragStrip() {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  })
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
    if (reducedMotion) return

    const el = trackRef.current
    if (!el) return

    // Critico: html ha scroll-behavior:smooth (ereditato) e blocca lo scrollLeft a rAF
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
        // Serve overflow reale per muoversi
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
  }, [reducedMotion])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const onTouchStart = () => pauseAuto()
    const onTouchEnd = () => scheduleResume()

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchend", onTouchEnd, { passive: true })
    el.addEventListener("touchcancel", onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") {
      pauseAuto()
      return
    }
    if (e.button !== 0) return
    const el = trackRef.current
    if (!el) return
    pauseAuto()
    drag.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    }
    suppressClick.current = false
    setGrabbing(true)
    el.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    const el = trackRef.current
    if (!state.active || !el) return
    const dx = e.clientX - state.startX
    if (Math.abs(dx) > DRAG_SLOP) state.moved = true
    el.scrollLeft = state.scrollLeft - dx
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state.active) return
    const el = trackRef.current
    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId)
    }
    suppressClick.current = state.moved
    state.active = false
    setGrabbing(false)
    scheduleResume()
  }

  const items = [...SECTORS, ...SECTORS]

  return (
    // Wrapper full-bleed: forza larghezza vincolata così overflow-x funziona
    <div className="-mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 xl:-mx-16 min-w-0">
      <div
        ref={trackRef}
        role="region"
        aria-label="Scorri i settori"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={[
          "flex w-full min-w-0 gap-3 sm:gap-4 md:gap-5 lg:gap-6",
          "overflow-x-auto overscroll-x-contain",
          "px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16",
          "select-none touch-pan-x",
          "pb-2 [scroll-behavior:auto] [-webkit-overflow-scrolling:touch]",
          grabbing ? "cursor-grabbing" : "cursor-grab",
        ].join(" ")}
      >
        {items.map((s, i) => (
          <Link
            key={`${s.id}-${i}`}
            to={`/settori/${s.id}`}
            draggable={false}
            onClick={(e) => {
              if (suppressClick.current) {
                e.preventDefault()
                e.stopPropagation()
                suppressClick.current = false
              }
            }}
            className={[
              "group relative shrink-0 overflow-hidden bg-white",
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
  )
}
