import type { CSSProperties, ReactNode } from "react"

import { useInViewOnce } from "../hooks/useInViewOnce"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

export type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "clip" | "fade"

type Props = {
  children: ReactNode
  /** Ritardo in ms, per scalare l'entrata di piu' elementi vicini. */
  delay?: number
  /** Durata in ms. Default 700. */
  duration?: number
  /** Variante di entrata. Default "up". */
  variant?: RevealVariant
  className?: string
  /** Come elemento HTML wrapper. Default "div". */
  as?: "div" | "section" | "article" | "header" | "footer" | "li" | "span"
  /** Root margin IntersectionObserver. */
  rootMargin?: string
  style?: CSSProperties
}

const HIDDEN: Record<RevealVariant, CSSProperties> = {
  up: { opacity: 0, transform: "translate3d(0, 28px, 0)" },
  down: { opacity: 0, transform: "translate3d(0, -20px, 0)" },
  left: { opacity: 0, transform: "translate3d(-32px, 0, 0)" },
  right: { opacity: 0, transform: "translate3d(32px, 0, 0)" },
  scale: { opacity: 0, transform: "scale(0.96)" },
  clip: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
  fade: { opacity: 0 },
}

const VISIBLE: Record<RevealVariant, CSSProperties> = {
  up: { opacity: 1, transform: "none" },
  down: { opacity: 1, transform: "none" },
  left: { opacity: 1, transform: "none" },
  right: { opacity: 1, transform: "none" },
  scale: { opacity: 1, transform: "none" },
  clip: { opacity: 1, clipPath: "inset(0 0 0 0)" },
  fade: { opacity: 1 },
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

/**
 * Entrata viewport (opacity/transform/clip-path).
 * Rispetta prefers-reduced-motion: mostra subito senza animazione.
 */
export default function Reveal({
  children,
  delay = 0,
  duration = 700,
  variant = "up",
  className = "",
  as: Tag = "div",
  rootMargin = "0px 0px -10% 0px",
  style,
}: Props) {
  const reducedMotion = usePrefersReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>({
    initialInView: reducedMotion,
    rootMargin,
  })

  const show = inView || reducedMotion
  const base = show ? VISIBLE[variant] : HIDDEN[variant]

  const transition = reducedMotion
    ? undefined
    : [
        `opacity ${duration}ms ${EASE} ${delay}ms`,
        variant === "clip"
          ? `clip-path ${duration}ms ${EASE} ${delay}ms`
          : variant !== "fade"
            ? `transform ${duration}ms ${EASE} ${delay}ms`
            : null,
      ]
        .filter(Boolean)
        .join(", ")

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        ...base,
        transition,
        willChange: show ? undefined : variant === "clip" ? "opacity, clip-path" : "opacity, transform",
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}
