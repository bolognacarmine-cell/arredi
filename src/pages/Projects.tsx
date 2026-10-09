import { useState, useEffect, useMemo, useRef } from "react"
import { Link } from "react-router-dom"
import { SECTORS } from "../data"
import { useProjects } from "../projectStore"
import FarcomImageWatermark, { productImageSrc } from "../components/FarcomImageWatermark"
import type { Rect } from "../lib/cloudinary/watermark"
import { isWatermarkContainerTooSmall } from "../lib/cloudinary/watermark"
import type { ProjectRecord } from "../projectStore"
import SEOHead from "../components/SEOHead"

const filters = [
  { id: "all", label: "Tutti" },
  ...SECTORS.map((s) => ({ id: s.id, label: s.label })),
]

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=900&fit=crop"

function projectCoverUrl(p: { coverImages?: string[]; image?: string }) {
  const raw =
    (p.coverImages && p.coverImages.length > 0 ? p.coverImages[0] : p.image) || FALLBACK_COVER
  return productImageSrc(raw)
}

/** Card griglia: stesso pattern dello showroom ProductCard (watermark dentro la foto). */
function ProjectGridCard({ project: p }: { project: ProjectRecord }) {
  const mediaRef = useRef<HTMLDivElement>(null)
  const [mediaSize, setMediaSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = mediaRef.current
    if (!el) return
    const apply = () => setMediaSize({ w: el.clientWidth, h: el.clientHeight })
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Badge settore alto-sinistra (sempre presente) — ostacolo UI proporzionale.
  const obstacles = useMemo((): Rect[] => {
    const { w } = mediaSize
    if (w <= 0) return []
    return [
      {
        x: 8,
        y: 8,
        w: Math.min(160, Math.max(88, w * 0.42)),
        h: 36,
      },
    ]
  }, [mediaSize])

  const coverSrc = projectCoverUrl(p)

  return (
    <Link
      to={`/progetti/${p.id}`}
      className="group block bg-white overflow-hidden border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        ref={mediaRef}
        className="relative aspect-[4/3] overflow-hidden bg-gray-100"
      >
        <img
          src={coverSrc}
          alt={p.title}
          width="1200"
          height="900"
          loading="lazy"
          fetchpriority="low"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            if (!target.src.includes("unsplash.com")) {
              target.src = FALLBACK_COVER
            }
          }}
        />
        {!isWatermarkContainerTooSmall(mediaSize.w, mediaSize.h) && (
          <FarcomImageWatermark
            layoutKey={`${mediaSize.w}x${mediaSize.h}`}
            obstacles={obstacles}
          />
        )}
        <span className="absolute top-4 left-4 z-10 bg-[#E69138] text-[#1A1A2E] text-xs px-3 py-1 font-semibold tracking-wide">
          {p.sector}
        </span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-lg lg:text-xl font-bold text-gray-900 mb-1">{p.title}</h3>
        <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
          {p.location} · {p.year}
        </p>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed line-clamp-3">{p.description}</p>
        <span className="mt-3 sm:mt-4 inline-block text-[#E69138] text-xs sm:text-sm font-semibold tracking-wide group-hover:tracking-widest transition-all">
          Vedi progetto →
        </span>
      </div>
    </Link>
  )
}

export default function Projects() {
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

  const [active, setActive] = useState("all")
  const projects = useProjects() || []

  const visible =
    active === "all"
      ? projects
      : Array.isArray(projects)
        ? projects.filter((p) => p.sectorId === active)
        : []

  return (
    <div className="bg-gray-50 min-h-screen pt-24">
      <SEOHead
        title="Progetti e Realizzazioni di Arredamento | Farcom Srl"
        description="Oltre 500 progetti di arredamento realizzati da Farcom Srl in tutta Italia: uffici, negozi, scuole, barberie, bar, locali e centri estetici. Esempi di arredamenti su misura e allestimenti realizzati a Macerata Campania, Caserta e Campania."
        canonical="https://www.farcomarredi.it/progetti"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Progetti e Realizzazioni di Arredamento | Farcom Srl",
          "description": "Portfolio con oltre 500 realizzazioni di arredamento su misura per attività commerciali e professionali in tutta Italia.",
          "url": "https://www.farcomarredi.it/progetti",
          "inLanguage": "it-IT",
          "hasPart": Array.isArray(projects) ? projects.slice(0, 12).map((p: ProjectRecord) => ({
            "@type": "CreativeWork",
            "name": p.title,
            "url": `https://www.farcomarredi.it/progetti/${p.id}`,
            "image": projectCoverUrl(p)
          })) : []
        }}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="pt-12 pb-14">
          <span className="text-[#E69138] text-xs tracking-widest uppercase font-semibold">
            Portfolio
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mt-2 mb-4">
            I nostri progetti
          </h1>
          <p className="text-gray-600 max-w-xl leading-relaxed">
            Oltre 500 realizzazioni in tutta Italia. Ogni progetto è unico, ogni spazio ha una
            storia da raccontare.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-gray-200 pb-4">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={`px-4 py-2 text-sm font-medium transition-all rounded-md ${
                active === f.id
                  ? "bg-[#E69138] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-[#E69138] hover:text-[#E69138]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-600 text-lg mb-4">Nessun progetto disponibile al momento</p>
            <Link
              to="/preventivo"
              className="inline-block px-5 py-2.5 bg-[#E69138] text-white text-sm font-medium rounded-md hover:bg-[#D67F28] transition-colors"
            >
              Richiedi un preventivo →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
            {visible.map((p) => (
              <ProjectGridCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
