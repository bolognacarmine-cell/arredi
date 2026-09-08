import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Use requestAnimationFrame to ensure scroll happens after DOM update
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
    })
  }, [pathname])

  return null
}
