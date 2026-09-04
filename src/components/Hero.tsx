import { Link } from "react-router-dom"

import HeroBackgroundVideo from "./HeroBackgroundVideo"
import { useInViewOnce } from "../hooks/useInViewOnce"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

export default function Hero() {
  // Above-the-fold: consideriamo l’hero “in view” subito per non dipendere da IO.
  const { ref, inView } = useInViewOnce<HTMLDivElement>({ initialInView: true })
  const reducedMotion = usePrefersReducedMotion()

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-[#1A1A2E] flex items-center"
      aria-label="Sezione introduttiva"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Grid di progettazione (molto sottile) */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
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

      {/* Video background: poster locale per LCP più stabile */}
      <HeroBackgroundVideo
        className="z-0"
        basePath="/videos/farcom-hero"
        poster="/barber-farcom1.jpg"
        fallbackImg="/barber-farcom.jpg"
        // Video HERO — sempre sopra la piega → priority=true per caricare SUBITO
        // (non vogliamo lazy: l'utente vede subito il poster se usa preload=none, non il video)
        priority={true}
      />

      {/* Overlay + glow animato (no-layout, solo transform/opacity) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(135deg, rgba(26,26,46,0.55) 0%, rgba(26,26,46,0.25) 45%, rgba(26,26,46,0.60) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-24 z-[2] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(230,145,56,0.22), transparent 62%), radial-gradient(closest-side, rgba(212,172,92,0.16), transparent 55%)",
          animation: reducedMotion ? undefined : "heroGlowDrift 8s ease-in-out infinite",
        }}
      />

      <div
        ref={ref}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* Copy */}
          <div className="lg:col-span-7">
            {/* Trust badge */}
            <div
              className={`flex items-center gap-3 sm:gap-4 mb-5 sm:mb-7 ${
                inView ? "opacity-0 fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#E69138] opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E69138]" />
                </span>
                <span className="text-[#E69138] text-[11px] sm:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.24em] uppercase">
                  Arredi su misura
                </span>
              </div>
              <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-[#E69138]/60 to-transparent" />
            </div>

            <h1
              className={`font-display text-[2rem] sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.2] sm:leading-[1.1] lg:leading-[1.05] tracking-tight ${
                inView ? "opacity-0 title-reveal" : "opacity-0"
              }`}
              style={{ animationDelay: "260ms", animationFillMode: "forwards" }}
            >
              Progettazione tecnica e{" "}
              <span className="text-[#E69138]">artigianalità premium</span>.
            </h1>

            <div
              className={`w-20 sm:w-24 h-1 bg-[#E69138] mt-4 sm:mt-5 mb-5 sm:mb-6 ${
                inView ? "opacity-0 line-expand" : "opacity-0"
              }`}
              style={{ animationDelay: "520ms", animationFillMode: "forwards" }}
            />

            <p
              className={`text-white/75 text-[15px] sm:text-base md:text-lg leading-[1.6] sm:leading-relaxed max-w-xl ${
                inView ? "opacity-0 slide-up" : "opacity-0"
              }`}
              style={{ animationDelay: "420ms", animationFillMode: "forwards" }}
            >
              Trasformiamo spazi commerciali in ambienti che comunicano fiducia:
              dal concept 3D ai disegni esecutivi, fino alla posa in opera.
              Tempi certi, materiali certificati, finiture impeccabili.
            </p>

            {/* CTA */}
            <div
              className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mt-7 sm:mt-8 ${
                inView ? "opacity-0 fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: "720ms", animationFillMode: "forwards" }}
            >
              <Link
                to="/preventivo"
                className="group relative inline-flex items-center justify-center min-h-[48px] bg-[#E69138] text-[#1A1A2E] text-sm font-semibold px-6 sm:px-8 py-3 sm:py-4 overflow-hidden shadow-lg shadow-[#E69138]/20 hover:scale-[1.03] hover:shadow-xl hover:shadow-[#E69138]/40 transition-all duration-300 ease-out glow-pulse magnetic-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E69138]"
                aria-label="Richiedi un preventivo gratuito"
              >
                <span className="absolute inset-0 bg-[#D67F28] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Richiedi un preventivo
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </Link>

              <Link
                to="/progetti"
                className="group relative inline-flex items-center justify-center min-h-[48px] border border-white/40 text-white text-sm font-semibold px-6 sm:px-8 py-3 sm:py-4 overflow-hidden hover:border-white/70 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Vedi i progetti"
              >
                <span className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
                <span className="relative z-10">Guarda i progetti</span>
              </Link>
            </div>

            {/* Micro-copy di conversione */}
            <p
              className={`text-white/60 text-xs mt-4 ${
                inView ? "opacity-0 fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: "860ms", animationFillMode: "forwards" }}
            >
              Risposta entro 24h lavorative. Nessun impegno.
            </p>

            {/* Trust row */}
            <div
              className={`flex flex-wrap items-center gap-x-5 sm:gap-x-7 gap-y-2.5 sm:gap-y-3 mt-6 sm:mt-8 ${
                inView ? "opacity-0 fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: "980ms", animationFillMode: "forwards" }}
            >
              {[
                ["25+ anni", "esperienza reale"],
                ["FSC/CE", "materiali certificati"],
                ["Tempi certi", "consegna puntuale"],
              ].map(([a, b]) => (
                <div key={a} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E69138]" aria-hidden="true" />
                  <span className="text-white/85 text-xs font-semibold tracking-wide">
                    {a}
                    <span className="text-white/55 font-medium"> · {b}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual / proof */}
          <div className="lg:col-span-5">
            <div
              className={`relative ${inView ? "opacity-0 float-up" : "opacity-0"}`}
              style={{ animationDelay: "820ms", animationFillMode: "forwards" }}
            >
              {/* Frame geometrico */}
              <div
                className="absolute -top-6 -right-6 w-64 h-64 border border-[#E69138]/25 geometric-appear hidden lg:block"
                style={{ animationDelay: "760ms", animationFillMode: "forwards" }}
                aria-hidden="true"
              />
              <div
                className="absolute top-8 right-10 w-44 h-44 border border-[#E69138]/15 geometric-appear hidden lg:block"
                style={{ animationDelay: "900ms", animationFillMode: "forwards" }}
                aria-hidden="true"
              />

              <div className="absolute -inset-6 bg-gradient-to-r from-[#E69138]/18 to-transparent blur-3xl" aria-hidden="true" />

              <div className="relative bg-white/6 backdrop-blur-md border border-white/12 rounded-2xl p-5 sm:p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo-farcom.png"
                    alt=""
                    aria-hidden="true"
                    className="h-7 sm:h-8 w-auto opacity-90"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
                </div>

                <h2 className="mt-5 sm:mt-6 text-white font-semibold text-[15px] sm:text-base">
                  Un processo chiaro, zero sorprese
                </h2>

                <ul className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3 text-sm text-white/70 leading-[1.6]">
                  {[
                    "Sopralluogo e briefing (obiettivi, flussi, budget)",
                    "Render 3D + disegni esecutivi",
                    "Produzione, installazione e post-vendita",
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-[10px] sm:mt-1.5 w-1.5 h-1.5 rounded-full bg-[#E69138] flex-shrink-0" aria-hidden="true" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs text-white/55">
                    <span className="text-white/80 font-semibold">Obiettivo:</span>{" "}
                    impatto visivo + conversione
                  </div>
                  <Link
                    to="/contatti"
                    className="inline-flex items-center self-start sm:self-auto min-h-[40px] px-2 -ml-2 font-semibold text-[#E69138] hover:text-[#F0B46C] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E69138] rounded-md"
                  >
                    Parla con noi →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hint di scroll (solo decorativo) */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-6 z-10 hidden sm:block">
          <div className="flex flex-col items-center gap-2 text-white/55">
            <span className="text-[10px] tracking-[0.22em] uppercase">Scroll</span>
            <span className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
