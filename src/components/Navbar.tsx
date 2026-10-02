import React, { useState, useEffect, useRef } from "react"

import { Link, useLocation } from "react-router-dom"
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion"

const links = [
  { label: "Home", to: "/" },
  { label: "Settori", to: "/settori" },
  { label: "Progetti", to: "/progetti" },
  { label: "Showroom", to: "/showroom" },
  { label: "Blog", to: "/blog" },
  { label: "Chi siamo", to: "/chi-siamo" },
  { label: "Contatti", to: "/contatti" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)

  const reducedMotion = usePrefersReducedMotion()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith("/admin")

  const lastScrollY = useRef<number>(0)
  const rafId = useRef<number | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
  const openRef = useRef(open)
  const visibleRef = useRef(visible)

  // Sync refs with state (this runs after render)
  openRef.current = open
  visibleRef.current = visible

  if (isAdmin) return null

  // Scroll behavior: direction detection + hysteresis + at-top pin + RAF throttle
  useEffect(() => {
    if (typeof window === "undefined") return

    const AT_TOP_THRESHOLD = 80
    const HIDE_AFTER_DOWN_PX = reducedMotion ? 20 : 40
    const SHOW_AFTER_UP_PX = reducedMotion ? 16 : 30

    let lastDecisionY = window.scrollY

    const applyState = (currentY: number) => {
      const atTopNow = currentY < AT_TOP_THRESHOLD
      const scrolledNow = currentY > AT_TOP_THRESHOLD

      let nextVisible: boolean

      if (atTopNow) {
        nextVisible = true
      } else if (openRef.current) {
        nextVisible = true
      } else {
        const deltaFromLastDecision = currentY - lastDecisionY
        if (deltaFromLastDecision > HIDE_AFTER_DOWN_PX) {
          nextVisible = false
          lastDecisionY = currentY
        } else if (deltaFromLastDecision < -SHOW_AFTER_UP_PX) {
          nextVisible = true
          lastDecisionY = currentY
        } else {
          nextVisible = visibleRef.current
        }
      }

      if (atTopNow) lastDecisionY = currentY

      setScrolled((prev: boolean) => (prev === scrolledNow ? prev : scrolledNow))
      setAtTop((prev: boolean) => (prev === atTopNow ? prev : atTopNow))
      setVisible((prev: boolean) => (prev === nextVisible ? prev : nextVisible))
    }

    const onScroll = () => {
      if (rafId.current != null) return

      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null
        applyState(window.scrollY)
      })
    }

    lastDecisionY = window.scrollY
    applyState(window.scrollY)

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafId.current != null) cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
  }, [reducedMotion])

  // Keyboard focus safety: if any focusable element inside navbar receives
  // focus while visible is false, force visible so the user can see it.
  useEffect(() => {
    if (typeof document === "undefined") return

    const checkFocus = () => {
      const navEl = navRef.current
      if (!navEl || visible) return
      const active = document.activeElement
      if (active && navEl.contains(active)) {
        setVisible(true)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && !visible) {
        setVisible(true)
      }
    }

    document.addEventListener("focusin", checkFocus)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("focusin", checkFocus)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [visible])

  // When user navigates (e.g. route change from /progetti to /chi-siamo)
  // reset visible state so the new page starts in a consistent "on top" feel.
  useEffect(() => {
    if (typeof window === "undefined") return
    lastScrollY.current = window.scrollY
    const y = window.scrollY
    setAtTop(y < 80)
    setScrolled(y > 80)
    setVisible(y < 80 ? true : visible)
  }, [location.pathname])

  const transitionClasses = reducedMotion ? "transition-none" : ""

  // When floating (visible, not at top, desktop only): pill centered, not flush
  const floatingPill = visible && !atTop && !open
  // On mobile/tablet (< lg) never render as pill — stay full width.
  const desktop =
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : true

  const usePillLayout = floatingPill && desktop

  // Compose transforms manually to avoid Tailwind translate-x / -y collisions:
  //   - centered pill → translateX(-50%)
  //   - hidden state → translateY(-115%)
  //   - both → translateX(-50%) translateY(-115%)
  const tx = usePillLayout ? "-50%" : "0%"
  const ty = visible || open ? "0%" : "-115%"
  const transform =
    tx === "0%" && ty === "0%"
      ? undefined
      : `translate3d(${tx}, ${ty}, 0)`

  const pillWidthStyle: React.CSSProperties = usePillLayout
    ? { left: "50%", maxWidth: "min(calc(100% - 2rem), 72rem)", width: "auto", right: "auto" as const }
    : { left: 0, right: 0 }

  const headerBackgroundClasses = usePillLayout
    ? "bg-[#E69138]/10 backdrop-blur-xl shadow-[0_6px_24px_-8px_rgba(230,145,56,0.15)] border border-[#E69138]/20 rounded-[999px] px-1.5"
    : scrolled
      ? "bg-[#E69138]/8 backdrop-blur-xl border-b border-[#E69138]/15"
      : "bg-transparent"

  const headerPositionStyle: React.CSSProperties =
    !atTop && desktop && !open
      ? { top: `calc(8px + env(safe-area-inset-top, 0px))` }
      : { top: 0, paddingTop: "env(safe-area-inset-top, 0px)" }

  const opacity = visible || open ? 1 : 0
  const pointerEvents = visible || open ? "auto" : "none"

  // Text color over the dark hero on Home (atTop && not scrolled): menu links + hamburger should be white
  // In floating pill / scrolled state we revert to the original dark palette (bg is light)
  const heroContrast = atTop && !scrolled

  function getLinkClass(l: { to: string }): string {
    if (heroContrast) {
      return location.pathname === l.to ? "text-white" : "text-white/85 hover:text-white"
    }
    return location.pathname === l.to
      ? "text-[#1A1A2E]"
      : "text-[#6B7280] hover:text-[#1A1A2E]"
  }

  const activeUnderline = atTop && !scrolled ? "bg-white" : "bg-[#E69138]"

  const hamburgerLineColor = heroContrast && !open ? "bg-white" : "bg-[#1A1A2E]"

  const transitionStyle: React.CSSProperties = reducedMotion
    ? { transition: "none" }
    : {
        transitionProperty:
          "opacity, transform, top, box-shadow, border-radius, background-color",
        transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)",
        transitionDuration: "320ms",
      }

  return (
    <>
      {/* Desktop-only hover hot-zone at the top of the viewport — brings the
          navbar back when the user moves the mouse towards the top edge while
          the bar is hidden. On touch / mobile the scroll-up behavior already
          shows it. */}
      <div
        aria-hidden="true"
        onMouseEnter={() => {
          if (atTop || open || visible) return
          setVisible(true)
        }}
        className="hidden md:block fixed top-0 left-0 right-0 h-[22px] z-[49]"
      />

      <header
        className={[
          "fixed z-50 will-change-transform",
          transitionClasses,
          headerBackgroundClasses,
        ].filter(Boolean).join(" ")}
        style={{
          ...pillWidthStyle,
          ...headerPositionStyle,
          ...transitionStyle,
          opacity,
          pointerEvents,
          transform,
        }}
      >
        <nav
          ref={navRef}
          id="site-navigation"
          aria-label="Navigazione principale"
          aria-hidden={!visible && !open}
          className={`${
            usePillLayout ? "px-1 sm:px-2" : "max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16"
          } flex items-center justify-between h-12 sm:h-14 md:h-16 lg:h-20`}
        >
          <Link
            to="/"
            className="flex items-center overflow-visible focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 rounded"
          >
            <img
              src="/logo-farcom.png"
              alt="Farcom Società Cooperativa"
              width="120"
              height="40"
              loading="eager"
              fetchpriority="high"
              className="h-8 sm:h-10 md:h-10 lg:h-12 w-auto object-contain overflow-visible"
            />
          </Link>

          <ul className="hidden lg:flex items-center gap-7 xl:gap-8 ml-6">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`text-base font-semibold relative group focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2 rounded ${transitionClasses} ${getLinkClass(l)}`}
                  aria-current={location.pathname === l.to ? "page" : undefined}
                >
                  {l.label}
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-[3px] ${activeUnderline} ${transitionClasses} group-hover:w-full ${
                      location.pathname === l.to ? "!w-full" : ""
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to="/preventivo"
            translate="no"
            className={`hidden lg:inline-flex items-center gap-2 text-sm font-semibold px-4 lg:px-5 py-2.5 rounded ml-6 ${transitionClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2 ${
              heroContrast && !usePillLayout
                ? "bg-white text-[#1A1A2E] hover:bg-[#E69138] hover:text-[#1A1A2E]"
                : "bg-[#E69138] text-[#1A1A2E] hover:bg-[#D67F28] hover:shadow-lg hover:shadow-[#E69138]/30"
            }`}
          >
            Richiedi preventivo
          </Link>

          <button
            type="button"
            id="mobile-menu-toggle"
            aria-controls="mobile-menu"
            aria-expanded={open}
            className={`lg:hidden w-10 sm:w-12 h-10 sm:h-12 -mr-1 sm:-mr-2 flex flex-col items-center justify-center gap-[7px] touch-manipulation focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 rounded ${open ? "open" : ""}`}
            onClick={() => setOpen((o: boolean) => !o)}
            aria-label={open ? "Chiudi menu di navigazione" : "Apri menu di navigazione"}
          >
            <span className={`line w-[28px] h-[3px] ${hamburgerLineColor} transition-all duration-300 ease-in-out rounded-full`} />
            <span className={`line w-[28px] h-[3px] ${hamburgerLineColor} transition-all duration-300 ease-in-out rounded-full`} />
            <span className={`line w-[28px] h-[3px] ${hamburgerLineColor} transition-all duration-300 ease-in-out rounded-full`} />
          </button>
        </nav>

        {open && (
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="false"
            aria-labelledby="mobile-menu-toggle"
            aria-hidden={!open}
            className="lg:hidden bg-[#FAFAFA]/95 backdrop-blur-md border-t border-[#E5E5E7] px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col gap-1"
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          >
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="flex items-center h-10 sm:h-12 px-2 text-sm font-semibold text-[#1A1A2E] hover:text-[#E69138] hover:bg-[#1A1A2E]/4 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                aria-current={location.pathname === l.to ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/preventivo"
              translate="no"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center bg-[#E69138] text-[#1A1A2E] text-xs sm:text-sm font-semibold px-4 sm:px-5 h-10 sm:h-12 mt-2 sm:mt-3 hover:bg-[#D67F28] hover:shadow-lg hover:shadow-[#E69138]/30 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2 rounded"
            >
              Richiedi preventivo
            </Link>
          </div>
        )}
      </header>
    </>
  )
}
