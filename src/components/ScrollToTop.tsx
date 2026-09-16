import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Double requestAnimationFrame to ensure scroll happens after complete DOM update
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (hash) {
          // scrollIntoView rispetta scroll-margin-top, quindi il titolo della
          // sezione non finisce sotto l'header fisso.
          const target = document.getElementById(hash.slice(1))
          if (target) {
            target.scrollIntoView({ block: "start" })
            return
          }
        }
        window.scrollTo(0, 0)
      })
    })
  }, [pathname, hash])

  return null
}
