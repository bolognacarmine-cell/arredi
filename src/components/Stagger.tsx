import { Children, type ReactNode, isValidElement } from "react"

import Reveal, { type RevealVariant } from "./Reveal"

type Props = {
  children: ReactNode
  /** Ritardo base tra figli in ms. Default 90. */
  step?: number
  /** Ritardo iniziale del primo figlio. */
  startDelay?: number
  variant?: RevealVariant
  duration?: number
  className?: string
  /** Classe applicata a ogni figlio wrappato. */
  itemClassName?: string
}

/**
 * Applica Reveal staggerato ai figli diretti.
 * Ideale per griglie di card / colonne servizi.
 */
export default function Stagger({
  children,
  step = 90,
  startDelay = 0,
  variant = "up",
  duration = 700,
  className = "",
  itemClassName = "",
}: Props) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child
        return (
          <Reveal
            key={child.key ?? i}
            delay={startDelay + i * step}
            variant={variant}
            duration={duration}
            className={itemClassName}
          >
            {child}
          </Reveal>
        )
      })}
    </div>
  )
}
