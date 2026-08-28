import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { label: "Home", to: "/" },
  { label: "Settori", to: "/settori/barbieri" },
  { label: "Progetti", to: "/progetti" },
  { label: "Chi siamo", to: "/chi-siamo" },
  { label: "Contatti", to: "/contatti" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");
  if (isAdmin) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#F7F5F0]/95 backdrop-blur-sm border-b border-[#DDD9D0]" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16 lg:h-20">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-6 h-6 bg-[#1B4332] rounded-sm" />
          <span className="font-display text-lg font-medium tracking-tight text-[#1A1A18]">
            Artigiana<span className="text-[#1B4332]">Legno</span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`text-sm font-medium transition-colors hover:text-[#1B4332] ${
                  location.pathname === l.to ? "text-[#1B4332]" : "text-[#4A4A46]"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/preventivo"
          className="hidden lg:inline-flex items-center gap-2 bg-[#1B4332] text-[#F7F5F0] text-sm font-medium px-5 py-2.5 hover:bg-[#143326] transition-colors"
        >
          Richiedi preventivo
        </Link>

        <button
          className="lg:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-px bg-[#1A1A18] transition-all duration-200 mb-1.5 ${open ? "rotate-45 translate-y-2.5" : ""}`} />
          <span className={`block w-5 h-px bg-[#1A1A18] transition-all duration-200 mb-1.5 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-[#1A1A18] transition-all duration-200 ${open ? "-rotate-45 -translate-y-1" : ""}`} />
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-[#F7F5F0] border-t border-[#DDD9D0] px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-base font-medium text-[#1A1A18]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/preventivo"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center bg-[#1B4332] text-[#F7F5F0] text-sm font-medium px-5 py-3 mt-2"
          >
            Richiedi preventivo
          </Link>
        </div>
      )}
    </header>
  );
}
