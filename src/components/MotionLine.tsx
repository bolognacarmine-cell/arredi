import { useInViewOnce } from "../hooks/useInViewOnce"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

type Props = {
  className?: string
  /** Colore della linea. Default accent bronzo. */
  color?: string
  /** Altezza in px. Default 2. */
  thickness?: number
  /** Ritardo ms. */
  delay?: number
  /** Origine: left | center | right */
  origin?: "left" | "center" | "right"
  /** Larghezza CSS (es. "4rem", "100%"). Default 100%. */
  width?: string
}

/**
 * Signature Farcom: linea bronzo che si espande all'ingresso in viewport.
 * Usata sotto titoli di sezione e nell'hero.
 */
export default function MotionLine({
  className = "",
  color = "#E69138",
  thickness = 2,
  delay = 0,
  origin = "left",
  width = "100%",
}: Props) {
  const reducedMotion = usePrefersReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLDivElement>({
    initialInView: reducedMotion,
    rootMargin: "0px 0px -8% 0px",
  })

  const show = inView || reducedMotion
  const originMap = {
    left: "left center",
    center: "center center",
    right: "right center",
  } as const

  return (
    <div
      ref={ref}
      className={className}
      aria-hidden="true"
      style={{
        width,
        height: thickness,
        backgroundColor: color,
        transformOrigin: originMap[origin],
        transform: show ? "scaleX(1)" : "scaleX(0)",
        opacity: show ? 1 : 0,
        transition: reducedMotion
          ? undefined
          : `transform 900ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity 400ms ease ${delay}ms`,
        willChange: show ? undefined : "transform, opacity",
      }}
    />
  )
}
