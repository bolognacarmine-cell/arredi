import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"

/** Soglia in px oltre la quale il gesto conta come drag (non come click sul link). */
const DRAG_SLOP = 8

type HorzDragScrollProps = {
  children: ReactNode
  /** Etichetta accessibile per la region scrollabile. */
  "aria-label": string
  className?: string
  /** Negative margin per full-bleed rispetto al container padre. */
  bleedClassName?: string
  /** Padding orizzontale allineato al layout della pagina. */
  padClassName?: string
}

/**
 * Strip orizzontale drag/swipe (mouse + touch) con axis lock.
 * Stessa logica di SectorDragStrip, senza auto-scroll.
 * Il click dopo un drag viene soppresso via onClickCapture.
 */
export default function HorzDragScroll({
  children,
  "aria-label": ariaLabel,
  className = "",
  bleedClassName = "-mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 xl:-mx-16",
  padClassName = "px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16",
}: HorzDragScrollProps) {
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
  const [grabbing, setGrabbing] = useState(false)

  // touchmove non-passive: preventDefault sullo swipe orizzontale
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
  }

  return (
    <div className={`${bleedClassName} min-w-0`}>
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault()
            e.stopPropagation()
            suppressClick.current = false
          }
        }}
        className={[
          "horz-scroll",
          "flex flex-row flex-nowrap w-full min-w-0 gap-3 sm:gap-4 md:gap-5 lg:gap-6",
          "overflow-x-auto overflow-y-hidden overscroll-x-contain",
          padClassName,
          "pb-2",
          "select-none touch-pan-y",
          "[scroll-behavior:auto] [-webkit-overflow-scrolling:touch]",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          grabbing ? "cursor-grabbing" : "cursor-grab",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </div>
  )
}
