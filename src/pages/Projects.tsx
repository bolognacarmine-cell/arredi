import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SECTORS } from "../data";
import { useProjects } from "../projectStore";

const filters = [
  { id: "all", label: "Tutti" },
  ...SECTORS.map((s) => ({ id: s.id, label: s.label })),
]

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

  const [active, setActive] = useState("all");
  const projects = useProjects() || []

  const visible = active === "all" ? projects : (Array.isArray(projects) ? projects.filter((p) => p.sectorId === active) : []);

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="pt-12 pb-14">
          <span className="text-[#6B7280] text-xs tracking-widest uppercase font-semibold">
            Portfolio
          </span>
          <h1 className="font-display text-5xl lg:text-6xl font-light text-[#1A1A2E] mt-2 mb-6">
            I nostri progetti
          </h1>
          <p className="text-[#6B7280] max-w-xl leading-relaxed">
            Oltre 500 realizzazioni in tutta Italia. Ogni progetto è unico, ogni
            spazio ha una storia da raccontare.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-[#E5E5E7] pb-6">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={`px-5 py-2 text-sm font-medium transition-all ${
                active === f.id
                  ? "bg-[#E69138] text-white"
                  : "bg-white border border-[#E5E5E7] text-[#4A4A46] hover:border-[#E69138] hover:text-[#E69138]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#6B7280] text-lg mb-4">Nessun progetto disponibile al momento</p>
            <Link
              to="/preventivo"
              className="inline-block px-6 py-3 bg-[#E69138] text-white rounded-lg hover:bg-[#D67F28] transition-colors"
            >
              Richiedi un preventivo →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
            {visible.map((p) => (
            <Link
              key={p.id}
              to={`/progetti/${p.id}`}
              className="group bg-white overflow-hidden border border-[#E5E5E7] hover:shadow-lg transition-shadow"
            >
              <div className="relative overflow-hidden aspect-[4/3] bg-[#E8E8EC]">
                <img
                  src={(p.coverImages && p.coverImages.length > 0 ? p.coverImages[0] : p.image) || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=900&fit=crop"}
                  alt={p.title}
                  width="1200"
                  height="900"
                  loading="lazy"
                  fetchpriority="low"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('unsplash.com')) {
                      target.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=900&fit=crop";
                    }
                  }}
                />
                <span className="absolute top-4 left-4 bg-[#E69138] text-white text-xs px-3 py-1 font-medium">
                  {p.sector}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-light text-[#1A1A2E] mb-1">
                  {p.title}
                </h3>
                <p className="text-[#6B7280] text-xs mb-3">
                  {p.location} · {p.year}
                </p>
                <p className="text-[#4A4A46] text-sm leading-relaxed line-clamp-2">
                  {p.description}
                </p>
                <span className="mt-4 inline-block text-[#E69138] text-xs font-semibold tracking-wide group-hover:tracking-widest transition-all">
                  Vedi progetto →
                </span>
              </div>
            </Link>
          ))}
        </div>
        )}
      </div>
    </div>
  )
}
