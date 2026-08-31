import { Link } from "react-router-dom"

import { useEffect, useState } from "react"

import { SECTORS, PROJECTS } from "../data"

import HeroBackgroundVideo from "../components/HeroBackgroundVideo"

// Custom Cursor Component
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState<Array<{ x: number y: number }>>([])

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
  return (
    <div className="bg-[#FAFAFA]">
      <CustomCursor />
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#1A1A2E]">
        {/* Elementi geometrici decorativi - griglia di progettazione */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(230, 145, 56, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212, 172, 92, 0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Linee guida geometriche */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E69138]/30 to-transparent opacity-0 line-draw"
            style={{ animationDelay: "1.5s" }}
          />
          <div
            className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AC5C]/20 to-transparent opacity-0 line-draw"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#D4AC5C]/20 to-transparent opacity-0 line-draw-vertical"
            style={{ animationDelay: "1.8s" }}
          />
        </div>

        {/* Video background (componente già absolute inset-0 autosufficiente) */}
        <HeroBackgroundVideo
          className="z-0"
          basePath="/videos/farcom-hero"
          poster="https://images.unsplash.com/photo-1547609434-b732edfee020?w=1920&h=1080&fit=crop&auto=format"
          fallbackImg="https://images.unsplash.com/photo-1547609434-b732edfee020?w=2560&h=1440&fit=crop&auto=format"
          priority
        />
        {/* Overlay professionale con nuova palette */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(135deg, rgba(26,26,46,0.4) 0%, rgba(26,26,46,0.3) 50%, rgba(26,26,46,0.4) 100%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Colonna principale - contenuto testuale */}
            <div className="lg:col-span-7">
              {/* Badge di fiducia premium */}
              <div
                className="flex items-center gap-4 mb-8 opacity-0 fade-in-up"
                style={{
                  animationDelay: "200ms",
                  animationFillMode: "forwards",
                  marginTop: "clamp(3rem, 8vh, 6rem)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#E69138] rounded-full animate-pulse" />
                  <span className="text-[#E69138] text-xs font-semibold tracking-[0.25em] uppercase">
                    Eccellenza certificata
                  </span>
                </div>
                <div className="h-px w-16 bg-gradient-to-r from-[#E69138]/50 to-transparent" />
              </div>

              {/* Titolo impattante con animazione di assemblaggio */}
              <div
                className="mb-6"
                style={{ marginTop: "clamp(2rem, 5vh, 4rem)" }}
              >
                <h1
                  className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight opacity-0 title-reveal mb-4"
                  style={{
                    animationDelay: "400ms",
                    animationFillMode: "forwards",
                  }}
                >
                  <span
                    className="block text-reveal"
                    style={{ animationDelay: "450ms" }}
                  >
                    Progettiamo e
                  </span>
                  <span
                    className="block text-[#E69138] text-reveal"
                    style={{ animationDelay: "550ms" }}
                  >
                    realizziamo il futuro
                  </span>
                </h1>
                <div
                  className="w-24 h-1 bg-[#E69138] opacity-0 line-expand"
                  style={{
                    animationDelay: "800ms",
                    animationFillMode: "forwards",
                  }}
                />
              </div>

              {/* Sottotitolo con slide-up sequenziale */}
              <p
                className="text-white/70 text-base md:text-lg font-normal max-w-xl leading-relaxed mb-8 opacity-0 slide-up"
                style={{
                  animationDelay: "600ms",
                  animationFillMode: "forwards",
                }}
              >
                Arredi su misura di precisione millimetrica. Dal concept tecnico
                all'esecuzione artigianale: un interlocutore unico per spazi che
                trasmettono competenza e qualità.
              </p>

              {/* CTA con glow e bordo animato */}
              <div
                className="flex flex-col sm:flex-row gap-4 mb-8 opacity-0 fade-in-up"
                style={{
                  animationDelay: "1000ms",
                  animationFillMode: "forwards",
                }}
              >
                <Link
                  to="/preventivo"
                  className="group relative inline-flex items-center justify-center bg-[#E69138] text-[#1A1A2E] text-sm font-semibold px-8 py-4 overflow-hidden shadow-lg shadow-[#E69138]/20 hover:scale-105 hover:shadow-xl hover:shadow-[#E69138]/40 transition-all duration-300 ease-out glow-pulse magnetic-hover"
                >
                  <div className="absolute inset-0 bg-[#D67F28] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-2">
                    Inizia il progetto
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
                  className="group relative inline-flex items-center justify-center border border-white/30 text-white text-sm font-medium px-8 py-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
                  <span className="relative z-10">Vedi i lavori</span>
                </Link>
              </div>

              {/* Badge di fiducia professionali */}
              <div
                className="flex flex-wrap items-center gap-6 opacity-0 fade-in-up"
                style={{
                  animationDelay: "1200ms",
                  animationFillMode: "forwards",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-[#E69138]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-white/60 text-xs font-medium tracking-wider uppercase">
                      500+ Progetti
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-[#E69138]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-white/60 text-xs font-medium tracking-wider uppercase">
                      100% Soddisfazione
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-[#E69138]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-white/60 text-xs font-medium tracking-wider uppercase">
                      ISO 9001
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonna secondaria - elementi geometrici e decorativi */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                {/* Rettangolo geometrico con animazione di assemblaggio */}
                <div
                  className="absolute top-0 right-0 w-64 h-64 border border-[#E69138]/30 opacity-0 geometric-appear"
                  style={{
                    animationDelay: "800ms",
                    animationFillMode: "forwards",
                  }}
                />
                <div
                  className="absolute top-8 right-8 w-48 h-48 border border-[#E69138]/20 opacity-0 geometric-appear"
                  style={{
                    animationDelay: "1000ms",
                    animationFillMode: "forwards",
                  }}
                />
                <div
                  className="absolute top-16 right-16 w-32 h-32 border border-[#E69138]/10 opacity-0 geometric-appear"
                  style={{
                    animationDelay: "1200ms",
                    animationFillMode: "forwards",
                  }}
                />

                {/* Card floating con blur effect */}
                <div
                  className="relative opacity-0 float-up"
                  style={{
                    animationDelay: "1400ms",
                    animationFillMode: "forwards",
                  }}
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#E69138]/20 to-transparent blur-3xl" />
                  <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#E69138]/20 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-[#E69138]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">
                            Precisione tecnica
                          </h3>
                          <p className="text-white/60 text-xs">
                            Tolleranze ±0.5mm
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#E69138]/20 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-[#E69138]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">
                            Materiali certificati
                          </h3>
                          <p className="text-white/60 text-xs">
                            FSC & CE compliant
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#E69138]/20 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-[#E69138]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">
                            Tempi garantiti
                          </h3>
                          <p className="text-white/60 text-xs">
                            Consegna puntuale
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes titleReveal {
            0% {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes lineExpand {
            from {
              opacity: 0;
              width: 0;
            }
            to {
              opacity: 1;
              width: 6rem;
            }
          }

          @keyframes lineDraw {
            from {
              opacity: 0;
              transform: scaleX(0);
            }
            to {
              opacity: 1;
              transform: scaleX(1);
            }
          }

          @keyframes lineDrawVertical {
            from {
              opacity: 0;
              transform: scaleY(0);
            }
            to {
              opacity: 1;
              transform: scaleY(1);
            }
          }

          @keyframes geometricAppear {
            from {
              opacity: 0;
              transform: scale(0.8) rotate(-5deg);
            }
            to {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
          }

          @keyframes floatUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes glowPulse {
            0%, 100% {
              box-shadow: 0 0 20px rgba(230, 145, 56, 0.3);
            }
            50% {
              box-shadow: 0 0 40px rgba(230, 145, 56, 0.6);
            }
          }

          @keyframes magnetic {
            0% {
              transform: translate(0, 0);
            }
            50% {
              transform: translate(5px, -5px);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          @keyframes textReveal {
            0% {
              clip-path: polygon(0 0, 0 0, 0 0, 0 0);
            }
            100% {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }

          @keyframes borderDance {
            0%, 100% {
              border-radius: 10px;
            }
            50% {
              border-radius: 50%;
            }
          }

          .fade-in-up {
            animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .slide-up {
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .title-reveal {
            animation: titleReveal 1s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .line-expand {
            animation: lineExpand 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .line-draw {
            animation: lineDraw 1.5s cubic-bezier(0.16, 1, 0.3, 1);
            transform-origin: left;
          }

          .line-draw-vertical {
            animation: lineDrawVertical 1.5s cubic-bezier(0.16, 1, 0.3, 1);
            transform-origin: top;
          }

          .geometric-appear {
            animation: geometricAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .float-up {
            animation: floatUp 1s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .glow-pulse {
            animation: glowPulse 2s ease-in-out infinite;
          }

          .magnetic-hover:hover {
            animation: magnetic 0.3s ease-in-out;
          }

          .text-reveal {
            animation: textReveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .border-dance:hover {
            animation: borderDance 0.6s ease-in-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .fade-in-up,
            .slide-up,
            .title-reveal,
            .line-expand,
            .line-draw,
            .line-draw-vertical,
            .geometric-appear,
            .float-up,
            .glow-pulse,
            .magnetic-hover:hover,
            .text-reveal,
            .border-dance:hover {
              animation: none;
              opacity: 1;
              transform: none;
            }
          }

          @media (max-width: 1024px) {
            .line-draw,
            .line-draw-vertical {
              display: none;
            }
          }
        `}</style>
      </section>

      {/* SECTORS */}
      <section className="py-20 md:py-24 lg:py-32 max-w-7xl mx-auto px-6 md:px-8 lg:px-16 relative bg-white">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="relative">
            {/* Elemento decorativo */}
            <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#E69138] to-transparent" />
            <span className="text-[#6B7280] text-xs tracking-[0.2em] uppercase font-semibold pl-4">
              Settori di attività
            </span>
            <h2
              className="font-display text-5xl lg:text-6xl font-bold text-[#1A1A2E] mt-2 pl-4"
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
            className="text-[#6B7280] max-w-xs text-sm leading-relaxed"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SECTORS.map((s, index) => (
            <Link
              key={s.id}
              to={`/settori/${s.id}`}
              className="group relative overflow-hidden bg-white aspect-[3/4] flex flex-col justify-end p-6 hover:shadow-2xl hover:shadow-[#E69138]/20 hover:-translate-y-2 transition-all duration-500 ease-out fade-in-up glow-pulse magnetic-hover"
              style={{
                animationDelay: `${(index + 1) * 150}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div className="absolute inset-0">
                <img
                  src={s.heroImage}
                  alt={s.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="relative z-10">
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  {s.label}
                </h3>
                <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-4">
                  {s.description}
                </p>
                <span className="text-[#E69138] text-xs font-medium tracking-wide group-hover:tracking-widest transition-all">
                  Scopri di più →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="py-20 md:py-24 lg:py-32 bg-[#1A1A2E] relative">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="relative">
              {/* Elemento decorativo */}
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#E69138] to-transparent" />
              <span className="text-[#6B7280] text-xs tracking-[0.2em] uppercase font-semibold pl-4">
                Portfolio
              </span>
              <h2
                className="font-display text-5xl lg:text-6xl font-bold text-white mt-2 pl-4"
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
              className="text-[#E69138] text-sm font-medium hover:underline"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.slice(0, 6).map((p, index) => (
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
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 bg-[#E69138] text-[#1A1A2E] text-xs px-3 py-1 font-semibold">
                    {p.sectorId.charAt(0).toUpperCase() + p.sectorId.slice(1)}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-white mb-1">
                    {p.title}
                  </h3>
                  <p className="text-[#6B7280] text-xs mb-3">
                    {p.location} · {p.year}
                  </p>
                  <p className="text-[#6B7280] text-sm leading-relaxed line-clamp-2">
                    {p.description}
                  </p>
                  <span className="mt-4 inline-block text-[#E69138] text-xs font-medium tracking-wide group-hover:tracking-widest transition-all">
                    Vedi progetto →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 md:py-24 lg:py-32 max-w-7xl mx-auto px-6 md:px-8 lg:px-16 relative bg-white">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="text-center mb-16">
          <span className="text-[#6B7280] text-xs tracking-[0.2em] uppercase font-semibold">
            Come lavoriamo
          </span>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-[#1A1A2E] mt-2">
            Il nostro processo
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((svc, i) => (
            <div
              key={svc.title}
              className="flex flex-col opacity-0 fade-in-up"
              style={{
                animationDelay: `${(i + 1) * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div className="flex items-center gap-4 mb-5">
                <span className="text-[#E69138] text-2xl">{svc.icon}</span>
                <span className="w-8 h-px bg-[#E5E5E7]" />
                <span className="text-[#6B7280] text-xs font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-[#1A1A2E] mb-3">
                {svc.title}
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 md:py-24 lg:py-32 bg-[#1A1A2E] relative">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16">
          <div className="text-center mb-16">
            <span className="text-[#E69138] text-xs tracking-[0.2em] uppercase font-semibold">
              Perché sceglierci
            </span>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-white mt-2">
              La differenza artigianale
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whys.map((w, index) => (
              <div
                key={w.label}
                className="border-t border-white/20 pt-6 opacity-0 fade-in-up"
                style={{
                  animationDelay: `${(index + 1) * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {w.label}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {w.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-20 md:py-24 lg:py-32 bg-white relative">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
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
              <div className="font-display text-5xl lg:text-6xl font-bold text-[#1A1A2E] mb-2">
                {n}
              </div>
              <div className="text-[#6B7280] text-sm">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-20 md:py-24 lg:py-32 max-w-7xl mx-auto px-6 md:px-8 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-8 relative bg-white">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-[#1A1A2E] max-w-xl">
            Hai un'idea per il tuo spazio?
            <br />
            <span className="text-[#E69138]">Parliamone.</span>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/preventivo"
            className="inline-flex items-center bg-[#E69138] text-[#1A1A2E] text-sm font-semibold px-7 py-4 hover:bg-[#D67F28] hover:scale-105 hover:shadow-xl hover:shadow-[#E69138]/40 transition-all duration-300 ease-out glow-pulse magnetic-hover"
          >
            Richiedi un preventivo gratuito
          </Link>
          <Link
            to="/contatti"
            className="inline-flex items-center border border-[#1A1A2E] text-[#1A1A2E] text-sm font-medium px-7 py-4 hover:bg-[#1A1A2E]/5 transition-colors"
          >
            Contattaci
          </Link>
        </div>
      </section>
    </div>
  )
}
