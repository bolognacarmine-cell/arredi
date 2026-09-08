import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Double requestAnimationFrame to ensure scroll happens after complete DOM update
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0)
      })
    })
  }, [pathname])

  return null
}
