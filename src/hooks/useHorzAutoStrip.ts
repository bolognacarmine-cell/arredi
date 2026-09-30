import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"

import { usePrefersReducedMotion } from "./usePrefersReducedMotion"

/** Soglia in px oltre la quale il gesto conta come drag (non come click sul link). */
const DRAG_SLOP = 8
/** Breakpoint allineato a Tailwind `sm`. */
const MOBILE_MQ = "(max-width: 639px)"
/** Dopo un drag/touch/hover, riprende lo scroll automatico. */
const RESUME_DELAY_MS = 2200

export type UseHorzAutoStripOptions = {
  /** Velocità auto-scroll desktop (px/s). */
  speedDesktop?: number
  /** Velocità auto-scroll mobile (px/s). */
  speedMobile?: number
  /** Disabilita l'auto-scroll (es. lista vuota). */
  enabled?: boolean
  /** Pausa al hover mouse (tipico homepage blog). */
  pauseOnHover?: boolean
}

/**
 * Strip orizzontale con auto-scroll continuo (right→left) via transform.
 * Stesso comportamento su desktop e mobile: evita scrollLeft programmatico,
 * inaffidabile su iOS/WebKit con overflow + -webkit-overflow-scrolling.
 */
export function useHorzAutoStrip({
  speedDesktop = 48,
  speedMobile = 32,
  enabled = true,
  pauseOnHover = false,
}: UseHorzAutoStripOptions = {}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const offset = useRef(0)
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startOffset: 0,
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

  const applyTransform = () => {
    const track = trackRef.current
    if (!track) return

    const half = track.scrollWidth / 2
    if (half <= 0) return

    let x = offset.current
    // Normalizza nel range [0, half) per il loop seamless (contenuto duplicato)
    if (half > 0) {
      x = ((x % half) + half) % half
    }
    offset.current = x
    track.style.transform = `translate3d(${-x}px, 0, 0)`
  }

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
    const el = viewportRef.current
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
    if (reducedMotion || !enabled) return

    const track = trackRef.current
    if (!track) return

    track.style.willChange = "transform"
    applyTransform()

    const mobileMq =
      typeof window !== "undefined" ? window.matchMedia(MOBILE_MQ) : null

    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (!paused.current && !drag.current.active && inView.current) {
        const half = track.scrollWidth / 2
        if (half > (viewportRef.current?.clientWidth ?? 0) * 0.5) {
          const speed = mobileMq?.matches ? speedMobile : speedDesktop
          offset.current += speed * dt
          applyTransform()
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
      track.style.willChange = ""
    }
  }, [reducedMotion, enabled, speedDesktop, speedMobile])

  // touchmove non-passive: preventDefault sullo swipe orizzontale
  useEffect(() => {
    const el = viewportRef.current
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
    if (!viewportRef.current || !trackRef.current) return

    pauseAuto()
    axis.current = "none"
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startOffset: offset.current,
      moved: false,
      pointerId: e.pointerId,
    }
    suppressClick.current = false
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    const el = viewportRef.current
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
    offset.current = state.startOffset - dx
    applyTransform()
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state.active && axis.current !== "x") {
      axis.current = "none"
      return
    }

    const el = viewportRef.current
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

  const onPointerEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pauseOnHover && e.pointerType === "mouse") pauseAuto()
  }

  const onPointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pauseOnHover && e.pointerType === "mouse") scheduleResume()
  }

  const handleCardClick = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    if (suppressClick.current) {
      e.preventDefault()
      e.stopPropagation()
      suppressClick.current = false
    }
  }

  return {
    viewportRef,
    trackRef,
    grabbing,
    handleCardClick,
    viewportProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onPointerEnter,
      onPointerLeave,
    },
  }
}

export default useHorzAutoStrip
