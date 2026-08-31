import { useState, useEffect } from "react"

import { Link, useLocation } from "react-router-dom"

const links = [
  { label: "Home", to: "/" },

  { label: "Settori", to: "/settori/barbieri" },

  { label: "Progetti", to: "/progetti" },

  { label: "Chi siamo", to: "/chi-siamo" },

  { label: "Contatti", to: "/contatti" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  const [open, setOpen] = useState(false)

  const location = useLocation()

  const isAdmin = location.pathname.startsWith("/admin")

  if (isAdmin) return null

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)

    window.addEventListener("scroll", onScroll)

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#FAFAFA]/95 backdrop-blur-md border-b border-[#E5E5E7]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 flex items-center justify-between h-16 lg:h-20">
        <Link to="/" className="flex items-center">
          <img
            src="/logo-farcom.png"
            alt="Farcom Società Cooperativa"
            className="h-10 w-auto object-contain lg:h-12"
          />
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`text-base font-semibold transition-all duration-300 relative group ${
                  location.pathname === l.to
                    ? "text-[#1A1A2E]"
                    : "text-[#6B7280] hover:text-[#1A1A2E]"
                }`}
              >
                {l.label}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 bg-[#E69138] transition-all duration-300 group-hover:w-full ${
                    location.pathname === l.to ? "w-full" : ""
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/preventivo"
          translate="no"
          className="hidden lg:inline-flex items-center gap-2 bg-[#E69138] text-[#1A1A2E] text-sm font-semibold px-5 py-2.5 hover:bg-[#D67F28] hover:scale-105 hover:shadow-lg hover:shadow-[#E69138]/30 transition-all duration-300 ease-out"
        >
          Richiedi preventivo
        </Link>

        <button
          className="lg:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span
            className={`block w-5 h-px bg-[#1A1A2E] transition-all duration-200 mb-1.5 ${
              open ? "rotate-45 translate-y-2.5" : ""
            }`}
          />
          <span
            className={`block w-5 h-px bg-[#1A1A2E] transition-all duration-200 mb-1.5 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-px bg-[#1A1A2E] transition-all duration-200 ${
              open ? "-rotate-45 -translate-y-1" : ""
            }`}
          />
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-[#FAFAFA]/95 backdrop-blur-md border-t border-[#E5E5E7] px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-base font-semibold text-[#1A1A2E] hover:text-[#E69138] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/preventivo"
            translate="no"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center bg-[#E69138] text-[#1A1A2E] text-sm font-semibold px-5 py-3 mt-2 hover:bg-[#D67F28] hover:scale-105 hover:shadow-lg hover:shadow-[#E69138]/30 transition-all duration-300 ease-out"
          >
            Richiedi preventivo
          </Link>
        </div>
      )}
    </header>
  )
}
