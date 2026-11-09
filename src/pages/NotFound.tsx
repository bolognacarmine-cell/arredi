import { Link } from "react-router-dom"
import SEOHead from "../components/SEOHead"

const LINKS = [
  { label: "Showroom", href: "/showroom" },
  { label: "Progetti", href: "/progetti" },
  { label: "Settori", href: "/settori" },
  { label: "Contatti", href: "/contatti" },
]

export default function NotFound() {
  return (
    <>
      <SEOHead
        title="Pagina non trovata | Farcom Design s.r.l."
        description="La pagina richiesta non esiste o è stata spostata. Torna alla home o esplora showroom, progetti e settori di Farcom Design."
        noindex
      />

      <main className="pt-32 pb-24 bg-[var(--background)] min-h-screen">
        <div className="max-w-3xl mx-auto px-6 md:px-8 lg:px-16 text-center">
          <p className="font-display text-7xl md:text-8xl font-light text-[var(--primary)] mb-6">
            404
          </p>

          <h1 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)] mb-4">
            Questa pagina non esiste
          </h1>

          <p className="text-[var(--foreground)] mb-10 max-w-xl mx-auto">
            Il link potrebbe essere vecchio oppure la pagina è stata spostata.
            Da qui puoi ripartire dalle sezioni principali del sito.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-6 py-3 border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            to="/"
            className="inline-flex px-6 py-3 bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--foreground)] transition-colors"
          >
            ← Torna alla home
          </Link>
        </div>
      </main>
    </>
  )
}
