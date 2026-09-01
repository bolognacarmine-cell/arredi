import { useState } from "react";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "../lib/cloudinary";
import { SECTORS } from "../data";
import { useProjects } from "../projectStore";

const filters = [
  { id: "all", label: "Tutti" },
  ...SECTORS.map((s) => ({ id: s.id, label: s.label })),
]

export default function Projects() {
  const [active, setActive] = useState("all");
  const projects = useProjects()

  const visible = active === "all" ? projects : projects.filter((p) => p.sectorId === active);

  return (
    <div className="bg-[#F7F5F0] min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="pt-12 pb-14">
          <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">
            Portfolio
          </span>
          <h1 className="font-display text-5xl lg:text-6xl font-light text-[#1A1A18] mt-2 mb-6">
            I nostri progetti
          </h1>
          <p className="text-[#888580] max-w-xl leading-relaxed">
            Oltre 500 realizzazioni in tutta Italia. Ogni progetto è unico, ogni
            spazio ha una storia da raccontare.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-[#DDD9D0] pb-6">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={`px-5 py-2 text-sm font-medium transition-all ${
                active === f.id
                  ? "bg-[#1B4332] text-white"
                  : "bg-white border border-[#DDD9D0] text-[#4A4A46] hover:border-[#1B4332] hover:text-[#1B4332]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
          {visible.map((p) => (
            <Link
              key={p.id}
              to={`/progetti/${p.id}`}
              className="group bg-white overflow-hidden border border-[#DDD9D0] hover:shadow-lg transition-shadow"
            >
              <div className="relative overflow-hidden aspect-[4/3] bg-[#EAE7E0]">
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-4 left-4 bg-[#1B4332] text-white text-xs px-3 py-1 font-medium">
                  {p.sector}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-light text-[#1A1A18] mb-1">
                  {p.title}
                </h3>
                <p className="text-[#888580] text-xs mb-3">
                  {p.location} · {p.year}
                </p>
                <p className="text-[#4A4A46] text-sm leading-relaxed line-clamp-2">
                  {p.description}
                </p>
                <span className="mt-4 inline-block text-[#1B4332] text-xs font-semibold tracking-wide group-hover:tracking-widest transition-all">
                  Vedi progetto →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
