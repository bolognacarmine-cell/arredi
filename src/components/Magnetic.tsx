import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react"

import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

type Props = {
  children: ReactNode
  className?: string
  /** Intensità magnetica in px. Default 10. Desktop only. */
  strength?: number
  /** Disabilita su touch / reduced-motion. */
  disabled?: boolean
  style?: CSSProperties
  as?: "div" | "span"
}

/**
 * Signature microinteraction: l'elemento segue leggermente il cursore (desktop).
 * Su mobile / prefers-reduced-motion resta statico.
 */
export default function Magnetic({
  children,
  className = "",
  strength = 10,
  disabled = false,
  style,
  as: Tag = "div",
}: Props) {
  const reducedMotion = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const active = !disabled && !reducedMotion

  const onMove = useCallback(
    (e: MouseEvent) => {
      if (!active || !ref.current) return
      // Solo desktop pointer fine
      if (window.matchMedia("(pointer: coarse)").matches) return
      const rect = ref.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * strength
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * strength
      setOffset({ x, y })
    },
    [active, strength],
  )

  const onLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 })
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        ...style,
        transform: active
          ? `translate3d(${offset.x}px, ${offset.y}px, 0)`
          : undefined,
        transition: active
          ? "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)"
          : undefined,
        willChange: active ? "transform" : undefined,
        display: Tag === "span" ? "inline-flex" : undefined,
      }}
    >
      {children}
    </Tag>
  )
}
