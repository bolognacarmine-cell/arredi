import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { resolveImageUrl } from "../lib/cloudinary";
import { useProjects } from "../projectStore";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projects = useProjects()
  const project = projects.find((p) => p.id === id);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setActiveImg(0)
  }, [id])

  const total = project?.gallery.length ?? 0

  const goPrev = useCallback(() => {
    setActiveImg((i) => (i <= 0 ? total - 1 : i - 1))
  }, [total])

  const goNext = useCallback(() => {
    setActiveImg((i) => (i >= total - 1 ? 0 : i + 1))
  }, [total])

  useEffect(() => {
    if (!project || total <= 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [project, total, goPrev, goNext])

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-[#F7F5F0]">
        <div className="text-center">
          <h1 className="font-display text-3xl text-[#1A1A18] mb-4">
            Progetto non trovato
          </h1>
          <Link
            to="/progetti"
            className="text-[#1B4332] text-sm hover:underline"
          >
            ← Torna ai progetti
          </Link>
        </div>
      </div>
    )
  }

  const related = projects.filter((p) => p.sectorId === project.sectorId && p.id !== project.id).slice(0, 3);

  return (
    <div className="bg-[#F7F5F0] min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="pt-8 pb-6">
          <Link
            to="/progetti"
            className="text-[#888580] text-xs hover:text-[#1B4332] transition-colors"
          >
            ← Tutti i progetti
          </Link>
        </div>

        {/* Carosello Gallery */}
        <div className="mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
            <div className="relative overflow-hidden bg-[#EAE7E0] aspect-[16/9] group">
              <img
                key={`${project.id}-${activeImg}`}
                src={resolveImageUrl(
                  {
                    src: project.gallery[activeImg],
                    publicId:
                      project.galleryCloudinaryPublicIds?.[activeImg] ??
                      null,
                  },
                  {
                    width: 2400,
                    height: 1350,
                    objectFit: "cover",
                    gravity: "auto",
                  },
                )}
                alt={`${project.title} — foto ${activeImg + 1} di ${total}`}
                className="w-full h-full object-cover animate-fade-in"
              />

              {total > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Foto precedente"
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 backdrop-blur border border-[#DDD9D0] flex items-center justify-center text-[#1A1A18] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all hover:bg-white hover:scale-105 shadow-lg"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Foto successiva"
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 backdrop-blur border border-[#DDD9D0] flex items-center justify-center text-[#1A1A18] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all hover:bg-white hover:scale-105 shadow-lg"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>

                  <div className="absolute top-3 right-3 bg-black/55 text-white text-xs font-medium px-2.5 py-1 rounded backdrop-blur">
                    {activeImg + 1} / {total}
                  </div>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {project.gallery.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Vai alla foto ${i + 1}`}
                        onClick={() => setActiveImg(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          activeImg === i
                            ? "w-6 bg-white shadow-md"
                            : "w-1.5 bg-white/55 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {total > 1 && (
              <div className="flex lg:flex-col gap-3 max-h-[520px] overflow-y-auto lg:max-h-none pr-0 lg:pr-1 scrollbar-thin">
                {project.gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Visualizza foto ${i + 1}`}
                    className={`relative overflow-hidden w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 border-2 transition-all ${
                      activeImg === i
                        ? "border-[#1B4332] shadow-md"
                        : "border-transparent opacity-65 hover:opacity-100 hover:border-[#1B4332]/50"
                    }`}
                  >
                    <img
                      src={resolveImageUrl(
                        {
                          src: img,
                          publicId:
                            project.galleryCloudinaryPublicIds?.[i] ?? null,
                        },
                        {
                          width: 240,
                          height: 240,
                          objectFit: "cover",
                          gravity: "auto",
                        },
                      )}
                      alt=""
                      className="w-full h-full object-cover"
                      loading={i > 3 ? "lazy" : "eager"}
                    />
                    {activeImg === i && (
                      <div className="absolute inset-0 ring-2 ring-[#1B4332] ring-inset pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {total > 1 && (
            <p className="text-[11px] text-[#888580] mt-3 text-center lg:text-left">
              Usa le frecce{" "}
              <kbd className="px-1.5 py-0.5 mx-0.5 border border-[#DDD9D0] bg-white text-[#4A4A46] text-[10px] font-mono rounded">
                ←
              </kbd>{" "}
              <kbd className="px-1.5 py-0.5 mx-0.5 border border-[#DDD9D0] bg-white text-[#4A4A46] text-[10px] font-mono rounded">
                →
              </kbd>{" "}
              della tastiera oppure i pallini per navigare nel carosello.
            </p>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-16 mb-20">
          <div>
            <span className="inline-block bg-[#1B4332] text-white text-xs px-3 py-1 font-medium mb-4">
              {project.sector}
            </span>
            <h1 className="font-display text-4xl lg:text-5xl font-light text-[#1A1A18] mb-6">
              {project.title}
            </h1>
            <p className="text-[#4A4A46] leading-relaxed text-base mb-8">
              {project.description}
            </p>

            <div>
              <h3 className="font-display text-lg font-medium text-[#1A1A18] mb-4">
                Arredi realizzati
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="bg-[#EAE7E0] text-[#4A4A46] text-xs px-4 py-2"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DDD9D0] p-8 h-fit">
            <h3 className="font-display text-lg font-medium text-[#1A1A18] mb-6">
              Scheda progetto
            </h3>
            <dl className="space-y-4 text-sm">
              {[
                ["Committente", project.client || "Privato"],
                ["Località", project.location],
                ["Anno", String(project.year)],
                ["Settore", project.sector],
                ["Materiali", project.materials],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-b border-[#EAE7E0] pb-4 last:border-0"
                >
                  <dt className="text-[#888580] text-xs uppercase tracking-wide mb-1">
                    {label}
                  </dt>
                  <dd className="text-[#1A1A18] font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#1B4332] p-10 mb-20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-light text-white mb-1">
              Vuoi un progetto simile?
            </h2>
            <p className="text-white/70 text-sm">
              Raccontaci la tua idea: valutiamo insieme la fattibilità.
            </p>
          </div>
          <Link
            to={`/preventivo?settore=${project.sectorId}`}
            className="flex-shrink-0 inline-flex items-center bg-white text-[#1B4332] text-sm font-semibold px-8 py-4 hover:bg-[#F7F5F0] transition-colors"
          >
            Richiedi un preventivo →
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mb-24">
            <h2 className="font-display text-2xl font-light text-[#1A1A18] mb-8">
              Progetti correlati
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/progetti/${p.id}`}
                  className="group bg-white border border-[#DDD9D0] overflow-hidden hover:shadow-md transition-shadow"
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
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-light text-[#1A1A18] mb-1">
                      {p.title}
                    </h3>
                    <p className="text-[#888580] text-xs">
                      {p.location} · {p.year}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
