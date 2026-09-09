import { useState, useEffect, useRef, useMemo } from "react"
import { Link, useLocation, Outlet } from "react-router-dom"

const nav = [
  { to: "/admin", label: "Dashboard", icon: "▦" },
  { to: "/admin/progetti", label: "Progetti", icon: "◫" },
  { to: "/admin/showroom/products", label: "Showroom Prodotti", icon: "▧" },
  { to: "/admin/showroom/offers", label: "Showroom Offerte", icon: "🏷" },
  { to: "/admin/preventivi", label: "Preventivi", icon: "◱" },
  { to: "/admin/media", label: "Media", icon: "◧" },
  { to: "/admin/impostazioni", label: "Impostazioni", icon: "⚙" },
]

const SIDEBAR_WIDTH_PX = 224
const SIDEBAR_ID = "admin-sidebar"

function isSidebarClosedByDefault(pathname: string) {
  return (
    pathname.startsWith("/admin/media") ||
    pathname.startsWith("/admin/progetti")
  )
}

export default function AdminLayout() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 100)
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 300)
  }, [])

  const location = useLocation()
  const [sideOpen, setSideOpen] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState(false)
  const sidebarRef = useRef<HTMLElement | null>(null)
  const sideOpenRef = useRef(sideOpen)
  sideOpenRef.current = sideOpen

  function computeDefaultFromRoute() {
    const p =
      (location && location.pathname) ||
      (typeof window !== "undefined" ? window.location.pathname : "/admin")
    return !isSidebarClosedByDefault(p)
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const wantOpen = computeDefaultFromRoute()
    if (sideOpenRef.current !== wantOpen) {
      setSideOpen(wantOpen)
    }
  }, [location.pathname])

  useEffect(() => {
    const wantOpen = computeDefaultFromRoute()
    setSideOpen(wantOpen)
    const t = window.setTimeout(() => {
      if (sideOpenRef.current !== wantOpen) setSideOpen(wantOpen)
    }, 50)
    return () => window.clearTimeout(t)
  }, [])

  const closeSidebar = () => setSideOpen(false)
  const toggleSidebar = () => setSideOpen((prev) => !prev)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && sideOpen) closeSidebar()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [sideOpen])

  const sidebarW = useMemo(
    () => (isMobile ? 256 : SIDEBAR_WIDTH_PX),
    [isMobile],
  )

  return (
    <div className="min-h-screen bg-[#F0EDE6] w-full relative overflow-x-hidden">
      {/* BACKDROP (click outside to close) */}
      <div
        aria-hidden="true"
        onClick={closeSidebar}
        className={`fixed inset-0 z-48 bg-black/45 transition-opacity duration-200 pointer-events-none ${
          sideOpen
            ? "opacity-100 pointer-events-auto animate-fade-in"
            : "opacity-0"
        }`}
      />

      {/* FLOATING TOGGLE — visibile SOLO quando sidebar è CHIUSA */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Apri menu di navigazione"
        aria-expanded={sideOpen}
        aria-controls={SIDEBAR_ID}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-30 ${
          sideOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        } transition-opacity duration-200 ease-out`}
      >
        <span
          className="bg-[#1A1A18] text-white w-10 h-12 rounded-r-xl shadow-xl border border-white/10 flex items-center justify-center text-lg hover:bg-[#2c2c28] active:bg-[#3a3a35] transition-colors touch-min-48"
          aria-hidden="true"
        >
          ☰
        </span>
      </button>

      {/* SIDEBAR DRAWER — overlay fixed puro in ogni viewport (display:hidden quando chiusa) */}
      <aside
        id={SIDEBAR_ID}
        ref={sidebarRef}
        role="navigation"
        aria-label="Menu amministrazione"
        aria-hidden={!sideOpen}
        className={`fixed top-0 left-0 h-screen z-49 bg-[#1A1A18] flex flex-col shadow-2xl ease-out ${
          isMobile ? "w-64" : "w-56"
        } transition-[transform,opacity,visibility] duration-200`}
        style={{
          transform: sideOpen ? "translateX(0)" : `translateX(-${sidebarW}px)`,
          opacity: sideOpen ? 1 : 0,
          visibility: sideOpen ? "visible" : "hidden",
          pointerEvents: sideOpen ? "auto" : "none",
        }}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-5 h-5 bg-[#B5965A] rounded-sm flex-shrink-0" />
            <span className="font-display text-sm font-medium text-white truncate">
              Farcom
            </span>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Chiudi menu di navigazione"
            className="text-white/50 hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 touch-min-44"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1 px-2 overflow-y-auto min-h-0">
          {nav.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/admin" &&
                location.pathname.startsWith(item.to))
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded ${
                  active
                    ? "bg-[#1B4332] text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-2 pb-4 border-t border-white/10 pt-4 flex-shrink-0">
          <Link
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-white/70 transition-colors rounded"
          >
            <span className="flex-shrink-0">←</span>
            <span>Vai al sito</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT — larghezza 100% sempre, nessun offset */}
      <div className="w-full min-h-screen flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-[#DDD9D0] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 flex-shrink-0">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sideOpen ? "Chiudi menu di navigazione" : "Apri menu di navigazione"}
            aria-expanded={sideOpen}
            aria-controls={SIDEBAR_ID}
            className="text-[#888580] hover:text-[#1A1A18] transition-colors touch-min-44 flex items-center justify-center w-9 h-9 rounded hover:bg-[#F7F5F0]"
          >
            <span aria-hidden="true">{sideOpen ? "✕" : "☰"}</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#888580]">Ugo</span>
            <div className="w-8 h-8 bg-[#1B4332] rounded-full flex items-center justify-center text-white text-xs font-medium">
              U
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
