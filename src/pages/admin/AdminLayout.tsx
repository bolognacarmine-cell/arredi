import { useState, useEffect } from "react"
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
  const [sideOpen, setSideOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) setSideOpen(false)
  }, [isMobile])

  return (
    <div className="min-h-screen flex bg-[#F0EDE6]">
      {/* Mobile overlay */}
      {isMobile && sideOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity animate-fade-in"
          onClick={() => setSideOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`bg-[#1A1A18] flex flex-col transition-all duration-200 z-50 ${
          isMobile
            ? sideOpen
              ? "fixed top-0 left-0 w-64 h-screen overflow-y-auto shadow-2xl"
              : "fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none"
            : `${
                sideOpen ? "w-56" : "w-14"
              } flex-shrink-0 sticky top-0 h-screen overflow-y-auto z-40`
        }`}
      >
        <div className={`h-14 flex items-center gap-3 px-4 border-b border-white/10 ${!isMobile ? "flex-shrink-0" : ""}`}>
          <span className="w-5 h-5 bg-[#B5965A] rounded-sm flex-shrink-0" />
          {(sideOpen || isMobile) && (
            <span className="font-display text-sm font-medium text-white truncate">
              Farcom
            </span>
          )}
        </div>

        <nav className={`flex-1 py-6 space-y-1 px-2 ${!isMobile ? "min-h-0" : ""}`}>
          {nav.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/admin" && location.pathname.startsWith(item.to))
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (isMobile) setSideOpen(false)
                }}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-[#1B4332] text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {(sideOpen || isMobile) && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className={`px-2 pb-4 border-t border-white/10 pt-4 ${!isMobile ? "flex-shrink-0" : ""}`}>
          <Link
            to="/"
            onClick={() => {
              if (isMobile) setSideOpen(false)
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <span className="flex-shrink-0">←</span>
            {(sideOpen || isMobile) && <span>Vai al sito</span>}
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-200">
        {/* Header */}
        <header className="h-14 bg-white border-b border-[#DDD9D0] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 flex-shrink-0">
          <button
            onClick={() => setSideOpen(!sideOpen)}
            className="text-[#888580] hover:text-[#1A1A18] transition-colors touch-min-44 flex items-center justify-center"
            aria-label={sideOpen ? "Chiudi menu" : "Apri menu"}
          >
            {isMobile && sideOpen ? "✕" : "☰"}
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
