import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const COOKIE_CONSENT_KEY = "cookie_consent_accepted"

export function hasCookieConsent(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(COOKIE_CONSENT_KEY) === "true"
}

export function acceptCookies(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(COOKIE_CONSENT_KEY, "true")
}

export function rejectCookies(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(COOKIE_CONSENT_KEY, "false")
}

export function resetCookieConsent(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(COOKIE_CONSENT_KEY)
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  useEffect(() => {
    // Only show banner if consent hasn't been given yet
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (consent === null) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    acceptCookies()
    setIsAnimatingOut(true)
    setTimeout(() => setIsVisible(false), 300)
  }

  const handleReject = () => {
    rejectCookies()
    setIsAnimatingOut(true)
    setTimeout(() => setIsVisible(false), 300)
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A2E]/95 backdrop-blur-md border-t border-white/10 transition-all duration-300 ${
        isAnimatingOut ? "opacity-0 translate-y-full" : "opacity-100 translate-y-0"
      }`}
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          {/* Message */}
          <div className="flex-1 max-w-3xl">
            <h2
              id="cookie-banner-title"
              className="text-white font-semibold text-base sm:text-lg mb-2"
            >
              Utilizziamo i cookie
            </h2>
            <p
              id="cookie-banner-description"
              className="text-white/70 text-sm sm:text-base leading-relaxed"
            >
              Utilizziamo cookie tecnici per garantire il corretto funzionamento del sito e migliorare la tua esperienza di navigazione. Per maggiori informazioni, consulta la nostra{" "}
              <Link
                to="/cookie"
                className="text-[#06B6D4] hover:text-[#22D3EE] underline underline-offset-2 transition-colors"
                onClick={() => setIsAnimatingOut(true)}
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="px-4 sm:px-5 py-2.5 text-sm sm:text-base text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              Rifiuta
            </button>
            <button
              onClick={handleAccept}
              className="px-4 sm:px-5 py-2.5 text-sm sm:text-base font-semibold text-[#1A1A2E] bg-[#06B6D4] hover:bg-[#22D3EE] rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50"
            >
              Accetta tutti
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
