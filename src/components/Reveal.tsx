import type { ReactNode } from "react"

import { useInViewOnce } from "../hooks/useInViewOnce"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

type Props = {
  children: ReactNode
  /** Ritardo in ms, per scalare l'entrata di piu' elementi vicini. */
  delay?: number
  className?: string
}

/**
 * Entrata discreta (fade-in + slide-up) quando l'elemento entra nel viewport.
 * Solo opacity/transform, quindi non provoca reflow; con prefers-reduced-motion
 * il contenuto viene reso subito senza animazione.
 */
export default function Reveal({ children, delay = 0, className = "" }: Props) {
  const reducedMotion = usePrefersReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>({
    initialInView: reducedMotion,
    rootMargin: "0px 0px -12% 0px",
  })

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(24px)",
        transition: reducedMotion
          ? undefined
          : `opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: inView ? undefined : "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}
