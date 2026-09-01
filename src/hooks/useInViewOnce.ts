import { useEffect, useRef, useState } from "react"

type Options = IntersectionObserverInit & {
  initialInView?: boolean
  once?: boolean
  rootMargin?: string
  threshold?: number | number[]
}

export function useInViewOnce<T extends HTMLElement = HTMLElement>(
  options: Options = {},
) {
  const {
    initialInView = false,
    once = true,
    rootMargin = "0px 0px -10% 0px",
    threshold = 0,
    ...rest
  } = options
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(initialInView)
  const triggeredRef = useRef(false)

  useEffect(() => {
    if (initialInView) {
      triggeredRef.current = true
      return
    }
    const el = ref.current
    if (!el) return
    if (triggeredRef.current && once) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) {
              triggeredRef.current = true
              observer.disconnect()
            }
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { rootMargin, threshold, ...rest },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [initialInView, once, rootMargin, threshold, JSON.stringify(rest)])

  return { ref, inView }
}

export default useInViewOnce
