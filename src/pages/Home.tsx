import { Link } from "react-router-dom"

import { useEffect, useState, useRef } from "react"

import { SECTORS } from "../data"
import { useProjects } from "../projectStore"

import Hero from "../components/Hero"
import ReviewsSection from "../components/ReviewsSection"
import ProductCard from "../components/showroom/ProductCard"
import Reveal from "../components/Reveal"
import { getProducts, type Product } from "../services/showroomApi"
import { resolveImageUrl } from "../lib/cloudinary"

// Experimental mode: check URL parameter ?settoriTest=true or environment variable
const ENABLE_EXPERIMENTAL_SETTORI =
  typeof window !== 'undefined' &&
  (new URLSearchParams(window.location.search).get('settoriTest') === 'true' ||
   import.meta.env.VITE_ENABLE_EXPERIMENTAL_SETTORI === 'true')

// Experimental configuration values
const SETTORI_CONFIG = {
  staggerDelay: 130, // ms between each card appearance
  revealDuration: 700, // ms for curtain reveal animation
  tiltMax: 8, // max tilt angle in degrees
}

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
        className="fixed pointer-events-none z-[9999] w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 border-[#E69138] transition-transform duration-75 ease-out hidden md:block"
        style={{
          transform: `translate(${position.x - 12}px, ${position.y - 12}px)`,
        }}
      />
      {trail.map((pos, i) => (
        <div
          key={i}
          className="fixed pointer-events-none z-[9998] w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#E69138]/20 transition-transform duration-150 ease-out hidden md:block"
          style={{
            transform: `translate(${pos.x - 6}px, ${pos.y - 6}px) scale(${1 - i * 0.15})`,
            opacity: 1 - i * 0.2,
          }}
        />
      ))}
    </>
  )
}

// Sector Card Component with experimental effects
function SectorCard({ sector, index, reversedIndex, experimental }: {
  sector: typeof SECTORS[0]
  index: number
  reversedIndex: number
  experimental: boolean
}) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [scrollX, setScrollX] = useState(0)

  useEffect(() => {
    if (!experimental) return

    const handleScroll = () => {
      if (!cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Only animate when card is in view
      if (rect.top < windowHeight && rect.bottom > 0) {
        const scrollProgress = 1 - (rect.top / windowHeight)
        // Move card from right to left during scroll
        const maxMovement = -50 // pixels
        setScrollX(scrollProgress * maxMovement)
      }
    }

    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [experimental])

  return (
    <Link
      ref={cardRef}
      to={`/settori/${sector.id}`}
      className={`group relative overflow-hidden bg-white aspect-[3/4] flex flex-col justify-end p-4 sm:p-5 md:p-6 ${
        experimental ? 'sector-card' : ''
      } ${
        experimental
          ? 'slide-in-right'
          : 'fade-in-up glow-pulse magnetic-hover hover:shadow-2xl hover:shadow-[#E69138]/20 hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 ease-out'
      }`}
      style={{
        ...(experimental
          ? {
              animationDelay: `${reversedIndex * SETTORI_CONFIG.staggerDelay}ms`,
              animationFillMode: 'forwards',
              transform: `translateX(${scrollX}px)`,
            }
          : {
              animationDelay: `${(index + 1) * 150}ms`,
              animationFillMode: 'forwards',
            }),
      }}
    >
      <div className="absolute inset-0">
        <img
          src={resolveImageUrl(
            {
              src: sector.heroImage,
              publicId: sector.heroImageCloudinaryPublicId ?? null,
            },
            {
              width: 1200,
              height: 1600,
              objectFit: "cover",
              gravity: "auto",
            },
          )}
          alt={sector.label}
          className={`w-full h-full object-cover ${
            experimental ? 'sector-image' : 'group-hover:scale-110 transition-transform duration-700'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent sm:from-black/70 sm:via-black/20" />
      </div>
      <div
        className={`relative z-10 ${
          experimental ? 'sector-content' : ''
        }`}
      >
        {/* Number indicator */}
        {experimental && (
          <span className="absolute -top-12 left-0 text-[#E69138] text-[10px] sm:text-xs font-mono font-semibold tracking-wider opacity-60">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
        <h3 className="font-display text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-1.5 md:mb-2 leading-snug">
          {sector.label}
        </h3>
        <p className="text-white/70 text-[11px] sm:text-xs leading-[1.65] sm:leading-[1.6] md:leading-relaxed line-clamp-2 mb-2 sm:mb-3 md:mb-4">
          {sector.description}
        </p>
        <span
          className={`inline-flex items-center min-h-[32px] sm:min-h-[36px] text-[#E69138] text-[10px] sm:text-xs font-medium tracking-wide ${
            experimental ? 'sector-cta' : 'group-hover:tracking-widest transition-all'
          }`}
        >
          Scopri di più →
        </span>
      </div>
    </Link>
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
  const featuredProjects = Array.isArray(projects) ? projects.filter((project) => project.featured).slice(0, 1) : []
  const displayedProjects =
    featuredProjects.length > 0 ? featuredProjects : (Array.isArray(projects) ? projects.slice(0, 1) : [])

  // Safety check to ensure displayedProjects is always an array
  const safeDisplayedProjects = Array.isArray(displayedProjects) ? displayedProjects : []

  const [showroomProducts, setShowroomProducts] = useState<Product[]>([])

  useEffect(() => {
    let alive = true
    getProducts()
      .then((list) => {
        if (!alive) return
        setShowroomProducts(
          Array.isArray(list) ? list.filter((p) => p.active).slice(0, 3) : [],
        )
      })
      .catch(() => setShowroomProducts([]))
    return () => {
      alive = false
    }
  }, [])

  // IntersectionObserver for scroll-based background changes
  useEffect(() => {
    const sections = document.querySelectorAll('section[data-bg]')
    if (sections.length === 0) return

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5 // Trigger when 50% of section is visible
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bgColor = entry.target.getAttribute('data-bg')
          if (bgColor) {
            document.body.style.backgroundColor = bgColor
          }
        }
      })
    }, observerOptions)

    sections.forEach((section) => observer.observe(section))

    // Set initial background from hero
    const heroSection = document.getElementById('hero')
    if (heroSection) {
      const heroBg = heroSection.getAttribute('data-bg')
      if (heroBg) {
        document.body.style.backgroundColor = heroBg
      }
    }

    return () => {
      sections.forEach((section) => observer.unobserve(section))
    }
  }, [])

  return (
    <div className="bg-[#FAFAFA]">
      <CustomCursor />
      {/* HERO */}
      <section id="hero" data-bg="#1A1A2E">
        <Hero />
      </section>

      {/* SECTORS */}
      <section id="settori" className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 relative bg-white" data-bg="#FFFFFF">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-5 md:gap-6 mb-5 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="relative">
            {/* Elemento decorativo */}
            <div className="absolute -left-1.5 sm:-left-2 md:-left-4 top-0 w-1 h-full bg-gradient-to-b from-[#E69138] to-transparent" />
            <span className="text-[#6B7280] text-[10px] sm:text-[11px] md:text-xs tracking-[0.16em] sm:tracking-[0.18em] md:tracking-[0.2em] uppercase font-semibold pl-2.5 sm:pl-3 md:pl-4">
              Settori di attività
            </span>
            <h2
              className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1A1A2E] mt-1.5 sm:mt-2 pl-2.5 sm:pl-3 md:pl-4 leading-[1.15] sm:leading-tight text-balance"
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
            className="text-[#6B7280] max-w-xs text-xs sm:text-sm leading-[1.65] sm:leading-relaxed"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {SECTORS.map((s, index) => {
            // Reverse index for right-to-left stagger (last card appears first)
            const reversedIndex = SECTORS.length - 1 - index
            return (
              <SectorCard
                key={s.id}
                sector={s}
                index={index}
                reversedIndex={reversedIndex}
                experimental={ENABLE_EXPERIMENTAL_SETTORI}
              />
            )
          })}
        </div>
      </section>

      {/* SHOWROOM: nascosto finche' non c'e' almeno un prodotto attivo */}
      {showroomProducts.length > 0 && (
        <section id="showroom" className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 bg-[#FAFAF7] relative" data-bg="#FAFAF7">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-5 md:gap-6 mb-5 sm:mb-6 md:mb-8 lg:mb-10">
              <div className="relative">
                <div className="absolute -left-1.5 sm:-left-2 md:-left-4 top-0 w-1 h-full bg-gradient-to-b from-[#E69138] to-transparent" />
                <span className="text-[#6B7280] text-[10px] sm:text-[11px] md:text-xs tracking-[0.16em] sm:tracking-[0.18em] md:tracking-[0.2em] uppercase font-semibold pl-2.5 sm:pl-3 md:pl-4">
                  Showroom
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1A1A2E] mt-1.5 sm:mt-2 pl-2.5 sm:pl-3 md:pl-4 leading-[1.15] sm:leading-tight text-balance">
                  Arredi pronti da scoprire
                </h2>
              </div>
              <Link
                to="/showroom"
                className="inline-flex items-center self-start min-h-[36px] sm:min-h-[40px] -ml-2 px-2 text-[#E69138] text-xs sm:text-sm font-medium hover:underline rounded-md"
              >
                Vedi tutto lo showroom →
              </Link>
            </div>

            <Reveal delay={80} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {showroomProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* FEATURED PROJECTS: nascosto se non ci sono progetti da mostrare */}
      {safeDisplayedProjects.length > 0 && (
      <section id="progetti" className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 bg-[#1A1A2E] relative" data-bg="#1A1A2E">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-5 md:gap-6 mb-5 sm:mb-6 md:mb-8 lg:mb-10">
            <div className="relative">
              {/* Elemento decorativo */}
              <div className="absolute -left-1.5 sm:-left-2 md:-left-4 top-0 w-1 h-full bg-gradient-to-b from-[#E69138] to-transparent" />
              <span className="text-[#6B7280] text-[10px] sm:text-[11px] md:text-xs tracking-[0.16em] sm:tracking-[0.18em] md:tracking-[0.2em] uppercase font-semibold pl-2.5 sm:pl-3 md:pl-4">
                Portfolio
              </span>
              <h2
                className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mt-1.5 sm:mt-2 pl-2.5 sm:pl-3 md:pl-4 leading-[1.15] sm:leading-tight text-balance"
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
              className="inline-flex items-center self-start min-h-[36px] sm:min-h-[40px] -ml-2 px-2 text-[#E69138] text-xs sm:text-sm font-medium hover:underline rounded-md"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {safeDisplayedProjects.map((p, index) => (
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
                    {p.sectorId ? p.sectorId.charAt(0).toUpperCase() + p.sectorId.slice(1) : ''}
                  </span>
                </div>
                <div className="p-4 sm:p-5 md:p-6">
                  <h3 className="font-display text-base sm:text-lg md:text-xl font-bold text-white mb-1 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-[#6B7280] text-[11px] sm:text-xs mb-2 sm:mb-2.5 md:mb-3">
                    {p.location} · {p.year}
                  </p>
                  <p className="text-[#6B7280] text-xs sm:text-sm leading-[1.65] sm:leading-[1.6] md:leading-relaxed line-clamp-2">
                    {p.description}
                  </p>
                  <span className="mt-2 sm:mt-3 md:mt-4 inline-flex items-center min-h-[32px] sm:min-h-[36px] text-[#E69138] text-[10px] sm:text-xs font-medium tracking-wide group-hover:tracking-widest transition-all">
                    Vedi progetto →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* RECENSIONI */}
      <ReviewsSection />

      {/* SERVICES */}
      <section id="servizi" className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 relative bg-white" data-bg="#FFFFFF">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <Reveal className="text-center mb-5 sm:mb-6 md:mb-8 lg:mb-10">
          <span className="text-[#6B7280] text-[10px] sm:text-[11px] md:text-xs tracking-[0.16em] sm:tracking-[0.18em] md:tracking-[0.2em] uppercase font-semibold">
            Come lavoriamo
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1A1A2E] mt-1.5 sm:mt-2 leading-[1.15] sm:leading-tight text-balance">
            Il nostro processo
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {services.map((svc, i) => (
            <div
              key={svc.title}
              className="flex flex-col opacity-0 fade-in-up"
              style={{
                animationDelay: `${(i + 1) * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-5">
                <span className="text-[#E69138] text-lg sm:text-xl md:text-2xl">{svc.icon}</span>
                <span className="w-4 sm:w-6 md:w-8 h-px bg-[#E5E5E7]" />
                <span className="text-[#6B7280] text-[10px] sm:text-xs font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-display text-base sm:text-lg md:text-xl font-bold text-[#1A1A2E] mb-2 sm:mb-2.5 md:mb-3 leading-snug">
                {svc.title}
              </h3>
              <p className="text-[#6B7280] text-xs sm:text-sm leading-[1.65] sm:leading-relaxed">
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 bg-[#1A1A2E] relative" data-bg="#1A1A2E">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16">
          <Reveal className="text-center mb-5 sm:mb-6 md:mb-8 lg:mb-10">
            <span className="text-[#E69138] text-[10px] sm:text-[11px] md:text-xs tracking-[0.16em] sm:tracking-[0.18em] md:tracking-[0.2em] uppercase font-semibold">
              Perché sceglierci
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mt-1.5 sm:mt-2 leading-[1.15] sm:leading-tight text-balance">
              La differenza artigianale
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {whys.map((w, index) => (
              <div
                key={w.label}
                className="border-t border-white/20 pt-4 sm:pt-5 md:pt-6 opacity-0 fade-in-up"
                style={{
                  animationDelay: `${(index + 1) * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <h3 className="font-display text-base sm:text-lg md:text-xl font-bold text-white mb-2 sm:mb-2.5 md:mb-3 leading-snug">
                  {w.label}
                </h3>
                <p className="text-white/60 text-xs sm:text-sm leading-[1.65] sm:leading-relaxed">
                  {w.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 bg-white relative" data-bg="#FFFFFF">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 text-center">
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
              <div className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-[#1A1A2E] mb-1 sm:mb-1.5 md:mb-2 leading-none">
                {n}
              </div>
              <div className="text-[#6B7280] text-[10px] sm:text-xs md:text-sm leading-snug">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-5 md:gap-6 lg:gap-8 relative bg-white" data-bg="#FFFFFF">
        {/* Separatore visivo */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

        <Reveal className="w-full lg:w-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1A1A2E] max-w-xl leading-[1.15] sm:leading-tight">
            Hai un'idea per il tuo spazio?
            <br />
            <span className="text-[#E69138]">Parliamone.</span>
          </h2>
        </Reveal>
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
