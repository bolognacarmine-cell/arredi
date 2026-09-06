import { Link } from "react-router-dom"

import { SECTORS } from "../data"
import { resolveImageUrl } from "../lib/cloudinary"

export default function SettoriList() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* HERO */}
      <section className="relative h-[50vh] sm:h-[60vh] flex items-end pb-12 sm:pb-16 overflow-hidden bg-[#1A1A2E]">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(230, 145, 56, 0.13) 1px, transparent 1px),
                linear-gradient(90deg, rgba(212, 172, 92, 0.10) 1px, transparent 1px)
              `,
              backgroundSize: "56px 56px",
            }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 w-full">
          <span className="block text-[#E69138] text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.16em] sm:tracking-[0.18em] md:tracking-[0.2em] uppercase mb-3 sm:mb-4">
            Settori di attività
          </span>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.15] sm:leading-tight">
            Ogni spazio ha la sua
            <br />
            <span className="text-[#E69138]">storia da raccontare</span>
          </h1>
        </div>
      </section>

      {/* SETTORI GRID */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 relative bg-white">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-5 md:gap-6 mb-5 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="relative">
            {/* Elemento decorativo */}
            <div className="absolute -left-1.5 sm:-left-2 md:-left-4 top-0 w-1 h-full bg-gradient-to-b from-[#E69138] to-transparent" />
            <span className="text-[#6B7280] text-[10px] sm:text-[11px] md:text-xs tracking-[0.16em] sm:tracking-[0.18em] md:tracking-[0.2em] uppercase font-semibold pl-2.5 sm:pl-3 md:pl-4">
              I nostri settori
            </span>
            <h2
              className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1A1A2E] mt-1.5 sm:mt-2 pl-2.5 sm:pl-3 md:pl-4 leading-[1.15] sm:leading-tight text-balance"
            >
              Scopri le nostre
              <br />
              <span className="text-[#E69138]">specializzazioni</span>
            </h2>
          </div>
          <p
            className="text-[#6B7280] max-w-xs text-xs sm:text-sm leading-[1.65] sm:leading-relaxed"
          >
            Quattro settori, un'unica filosofia: progettazione attenta,
            materiali di qualità, esecuzione impeccabile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {SECTORS.map((s, index) => (
            <Link
              key={s.id}
              to={`/settori/${s.id}`}
              className="group relative overflow-hidden bg-white aspect-[3/4] flex flex-col justify-end p-4 sm:p-5 md:p-6 hover:shadow-2xl hover:shadow-[#E69138]/20 hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 ease-out fade-in-up glow-pulse magnetic-hover min-h-[40px] sm:min-h-[44px]"
              style={{
                animationDelay: `${(index + 1) * 150}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div className="absolute inset-0">
                <img
                  src={resolveImageUrl(
                    {
                      src: s.heroImage,
                      publicId: s.heroImageCloudinaryPublicId ?? null,
                    },
                    {
                      width: 1200,
                      height: 1600,
                      objectFit: "cover",
                      gravity: "auto",
                    },
                  )}
                  alt={s.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent sm:from-black/70 sm:via-black/20" />
              </div>
              <div className="relative z-10">
                <h3 className="font-display text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-1.5 md:mb-2 leading-snug">
                  {s.label}
                </h3>
                <p className="text-white/70 text-[11px] sm:text-xs leading-[1.65] sm:leading-[1.6] md:leading-relaxed line-clamp-2 mb-2 sm:mb-3 md:mb-4">
                  {s.description}
                </p>
                <span className="inline-flex items-center min-h-[32px] sm:min-h-[36px] text-[#E69138] text-[10px] sm:text-xs font-medium tracking-wide group-hover:tracking-widest transition-all">
                  Scopri di più →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-5 md:gap-6 lg:gap-8 relative bg-white">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="w-full lg:w-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1A1A2E] max-w-xl leading-[1.15] sm:leading-tight">
            Hai un'idea per il tuo spazio?
            <br />
            <span className="text-[#E69138]">Parliamone.</span>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
          <Link
            to="/preventivo"
            className="inline-flex items-center justify-center min-h-[44px] sm:min-h-[48px] bg-[#E69138] text-[#1A1A2E] text-xs sm:text-sm font-semibold px-4 sm:px-5 md:px-6 lg:px-7 py-2.5 sm:py-3 md:py-4 hover:bg-[#D67F28] hover:shadow-xl hover:shadow-[#E69138]/40 transition-all duration-300 ease-out glow-pulse magnetic-hover w-full sm:w-auto"
          >
            Richiedi un preventivo gratuito
          </Link>
          <Link
            to="/contatti"
            className="inline-flex items-center justify-center min-h-[44px] sm:min-h-[48px] border border-[#1A1A2E] text-[#1A1A2E] text-xs sm:text-sm font-medium px-4 sm:px-5 md:px-6 lg:px-7 py-2.5 sm:py-3 md:py-4 hover:bg-[#1A1A2E]/5 transition-colors w-full sm:w-auto"
          >
            Contattaci
          </Link>
        </div>
      </section>
    </div>
  )
}