import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Più aggressivo per garantire lo scroll all'inizio
    const scrollToTop = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    // Timeout multipli per assicurarsi che lo scroll avvenga dopo che tutto è caricato
    scrollToTop()
    setTimeout(scrollToTop, 0)
    setTimeout(scrollToTop, 100)
    setTimeout(scrollToTop, 300)

    if (hash) {
      // Per hash, scrolla all'elemento specifico dopo un breve delay
      setTimeout(() => {
        const target = document.getElementById(hash.slice(1))
        if (target) {
          target.scrollIntoView({ block: "start" })
        }
      }, 300)
    }
  }, [pathname, hash])

  return null
}
