import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Use requestAnimationFrame to ensure scroll happens after DOM update
    // Use instant behavior for immediate scroll to top on route change
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    })
  }, [pathname])

  return null
}
