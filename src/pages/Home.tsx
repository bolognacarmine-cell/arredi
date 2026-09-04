import { Link } from "react-router-dom"

import { useEffect, useState } from "react"

import { SECTORS } from "../data"
import { useProjects } from "../projectStore"

import Hero from "../components/Hero"
import ReviewsSection from "../components/ReviewsSection"
import { resolveImageUrl } from "../lib/cloudinary"

// Custom Cursor Component
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setTrail((prev) => [{ x: e.clientX, y: e.clientY }, ...prev.slice(0, 5)])
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <>
      <div
        className="fixed pointer-events-none z-[9999] w-8 h-8 rounded-full border-2 border-[#E69138] transition-transform duration-75 ease-out hidden md:block"
        style={{
          transform: `translate(${position.x - 16}px, ${position.y - 16}px)`,
        }}
      />
      {trail.map((pos, i) => (
        <div
          key={i}
          className="fixed pointer-events-none z-[9998] w-4 h-4 rounded-full bg-[#E69138]/20 transition-transform duration-150 ease-out hidden md:block"
          style={{
            transform: `translate(${pos.x - 8}px, ${pos.y - 8}px) scale(${1 - i * 0.15})`,
            opacity: 1 - i * 0.2,
          }}
        />
      ))}
    </>
  )
}

const services = [
  {
    title: "Progettazione",
    desc: "Ascoltiamo le tue esigenze e trasformiamo l'idea in un progetto tecnico dettagliato, con render 3D e disegni costruttivi.",
    icon: "✦",
  },

  {
    title: "Realizzazione",
    desc: "Produzione artigianale nel nostro laboratorio a Bologna, con materiali selezionati e lavorazioni a regola d'arte.",
    icon: "◈",
  },

  {
    title: "Installazione",
    desc: "Posa in opera rapida e precisa da parte del nostro team. Rispettiamo i tempi concordati e lasciamo il cantiere pulito.",
    icon: "⬡",
  },

  {
    title: "Post-vendita",
    desc: "Supporto e manutenzione nel tempo. Gli arredi su misura meritano cura: siamo presenti anche dopo la consegna.",
    icon: "◇",
  },
]

const whys = [
  {
    label: "25 anni di esperienza",
    value: "Dal 1999 realizziamo arredi per professionisti esigenti.",
  },

  {
    label: "100% made in Italy",
    value:
      "Ogni pezzo è progettato e costruito nel nostro laboratorio di Bologna.",
  },

  {
    label: "Materiali certificati",
    value:
      "Legni FSC, vernici a bassa emissione, ferramenta di qualità superiore.",
  },

  {
    label: "Tempi certi",
    value:
      "Consegnamo nei tempi pattuiti. Sempre. È una questione di rispetto.",
  },
]

export default function Home() {
  const projects = useProjects()
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 6)
  const displayedProjects =
    featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 6)

  return (
    <div className="bg-[#FAFAFA]">
      <CustomCursor />
      {/* HERO */}
      <Hero />

      {/* SECTORS */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 relative bg-white">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
          <div className="relative">
            {/* Elemento decorativo */}
            <div className="absolute -left-2 sm:-left-4 top-0 w-1 h-full bg-gradient-to-b from-[#E69138] to-transparent" />
            <span className="text-[#6B7280] text-[11px] sm:text-xs tracking-[0.18em] sm:tracking-[0.2em] uppercase font-semibold pl-3 sm:pl-4">
              Settori di attività
            </span>
            <h2
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A2E] mt-2 pl-3 sm:pl-4 leading-[1.15] sm:leading-tight text-balance"
              style={{
                opacity: 0,
                animation:
                  "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                animationDelay: "200ms",
              }}
            >
              Ogni spazio ha la sua
              <br />
              <span className="text-[#E69138]">storia da raccontare</span>
            </h2>
          </div>
          <p
            className="text-[#6B7280] max-w-xs text-sm leading-[1.65] sm:leading-relaxed"
            style={{
              opacity: 0,
              animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              animationDelay: "300ms",
            }}
          >
            Quattro settori, un'unica filosofia: progettazione attenta,
            materiali di qualità, esecuzione impeccabile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {SECTORS.map((s, index) => (
            <Link
              key={s.id}
              to={`/settori/${s.id}`}
              className="group relative overflow-hidden bg-white aspect-[3/4] flex flex-col justify-end p-5 sm:p-6 hover:shadow-2xl hover:shadow-[#E69138]/20 hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 ease-out fade-in-up glow-pulse magnetic-hover min-h-[44px]"
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
                <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2 leading-snug">
                  {s.label}
                </h3>
                <p className="text-white/70 text-xs leading-[1.6] sm:leading-relaxed line-clamp-2 mb-3 sm:mb-4">
                  {s.description}
                </p>
                <span className="inline-flex items-center min-h-[36px] text-[#E69138] text-xs font-medium tracking-wide group-hover:tracking-widest transition-all">
                  Scopri di più →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-[#1A1A2E] relative">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
            <div className="relative">
              {/* Elemento decorativo */}
              <div className="absolute -left-2 sm:-left-4 top-0 w-1 h-full bg-gradient-to-b from-[#E69138] to-transparent" />
              <span className="text-[#6B7280] text-[11px] sm:text-xs tracking-[0.18em] sm:tracking-[0.2em] uppercase font-semibold pl-3 sm:pl-4">
                Portfolio
              </span>
              <h2
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 pl-3 sm:pl-4 leading-[1.15] sm:leading-tight text-balance"
                style={{
                  opacity: 0,
                  animation:
                    "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  animationDelay: "200ms",
                }}
              >
                Progetti in evidenza
              </h2>
            </div>
            <Link
              to="/progetti"
              className="inline-flex items-center self-start min-h-[40px] -ml-2 px-2 text-[#E69138] text-sm font-medium hover:underline rounded-md"
              style={{
                opacity: 0,
                animation:
                  "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                animationDelay: "300ms",
              }}
            >
              Vedi tutti i progetti →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {displayedProjects.map((p, index) => (
              <Link
                key={p.id}
                to={`/progetti/${p.id}`}
                className="group bg-[#252523] overflow-hidden hover:bg-[#2D2D2B] hover:shadow-xl hover:shadow-[#E69138]/20 hover:-translate-y-2 transition-all duration-500 ease-out fade-in-up"
                style={{
                  animationDelay: `${(index + 1) * 150}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={resolveImageUrl(
                      {
                        src: p.image,
                        publicId: p.imageCloudinaryPublicId ?? null,
                      },
                      {
                        width: 1200,
                        height: 900,
                        objectFit: "cover",
                        gravity: "auto",
                      },
                    )}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 bg-[#E69138] text-[#1A1A2E] text-xs px-3 py-1 font-semibold">
                    {p.sectorId.charAt(0).toUpperCase() + p.sectorId.slice(1)}
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-[#6B7280] text-xs mb-2.5 sm:mb-3">
                    {p.location} · {p.year}
                  </p>
                  <p className="text-[#6B7280] text-sm leading-[1.6] sm:leading-relaxed line-clamp-2">
                    {p.description}
                  </p>
                  <span className="mt-3 sm:mt-4 inline-flex items-center min-h-[36px] text-[#E69138] text-xs font-medium tracking-wide group-hover:tracking-widest transition-all">
                    Vedi progetto →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RECENSIONI */}
      <ReviewsSection />

      {/* SERVICES */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 relative bg-white">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <span className="text-[#6B7280] text-[11px] sm:text-xs tracking-[0.18em] sm:tracking-[0.2em] uppercase font-semibold">
            Come lavoriamo
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A2E] mt-2 leading-[1.15] sm:leading-tight text-balance">
            Il nostro processo
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {services.map((svc, i) => (
            <div
              key={svc.title}
              className="flex flex-col opacity-0 fade-in-up"
              style={{
                animationDelay: `${(i + 1) * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <span className="text-[#E69138] text-xl sm:text-2xl">{svc.icon}</span>
                <span className="w-6 sm:w-8 h-px bg-[#E5E5E7]" />
                <span className="text-[#6B7280] text-xs font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#1A1A2E] mb-2.5 sm:mb-3 leading-snug">
                {svc.title}
              </h3>
              <p className="text-[#6B7280] text-sm leading-[1.65] sm:leading-relaxed">
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-[#1A1A2E] relative">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <span className="text-[#E69138] text-[11px] sm:text-xs tracking-[0.18em] sm:tracking-[0.2em] uppercase font-semibold">
              Perché sceglierci
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 leading-[1.15] sm:leading-tight text-balance">
              La differenza artigianale
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {whys.map((w, index) => (
              <div
                key={w.label}
                className="border-t border-white/20 pt-6 opacity-0 fade-in-up"
                style={{
                  animationDelay: `${(index + 1) * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-2.5 sm:mb-3 leading-snug">
                  {w.label}
                </h3>
                <p className="text-white/60 text-sm leading-[1.65] sm:leading-relaxed">
                  {w.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-white relative">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 text-center">
          {[
            ["500+", "Progetti realizzati"],

            ["25", "Anni di attività"],

            ["4", "Settori serviti"],

            ["98%", "Clienti soddisfatti"],
          ].map(([n, l], index) => (
            <div
              key={n}
              className="opacity-0 fade-in-up"
              style={{
                animationDelay: `${(index + 1) * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-[#1A1A2E] mb-1.5 sm:mb-2 leading-none">
                {n}
              </div>
              <div className="text-[#6B7280] text-xs sm:text-sm leading-snug">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 md:gap-8 relative bg-white">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="w-full lg:w-auto">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A2E] max-w-xl leading-[1.15] sm:leading-tight">
            Hai un'idea per il tuo spazio?
            <br />
            <span className="text-[#E69138]">Parliamone.</span>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Link
            to="/preventivo"
            className="inline-flex items-center justify-center min-h-[48px] bg-[#E69138] text-[#1A1A2E] text-sm font-semibold px-6 sm:px-7 py-3 sm:py-4 hover:bg-[#D67F28] hover:shadow-xl hover:shadow-[#E69138]/40 transition-all duration-300 ease-out glow-pulse magnetic-hover w-full sm:w-auto"
          >
            Richiedi un preventivo gratuito
          </Link>
          <Link
            to="/contatti"
            className="inline-flex items-center justify-center min-h-[48px] border border-[#1A1A2E] text-[#1A1A2E] text-sm font-medium px-6 sm:px-7 py-3 sm:py-4 hover:bg-[#1A1A2E]/5 transition-colors w-full sm:w-auto"
          >
            Contattaci
          </Link>
        </div>
      </section>
    </div>
  )
}
