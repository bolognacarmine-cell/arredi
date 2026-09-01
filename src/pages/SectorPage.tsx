import { useParams, Link } from "react-router-dom"
import { SECTORS, PROJECTS } from "../data"
import { resolveImageUrl } from "../lib/cloudinary"

const steps = [
  {
    n: "01",
    label: "Sopralluogo",
    desc: "Visitiamo il tuo spazio, ascoltiamo le esigenze e prendiamo le misure.",
  },
  {
    n: "02",
    label: "Progettazione",
    desc: "Sviluppiamo il progetto con render 3D e disegni tecnici esecutivi.",
  },
  {
    n: "03",
    label: "Realizzazione",
    desc: "Costruiamo nel nostro laboratorio con materiali selezionati.",
  },
  {
    n: "04",
    label: "Installazione",
    desc: "Consegna e posa in opera nei tempi pattuiti, chiavi in mano.",
  },
]

export default function SectorPage() {
  const { id } = useParams<{ id: string }>()
  const sector = SECTORS.find((s) => s.id === id)

  if (!sector) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-[#F7F5F0]">
        <div className="text-center">
          <h1 className="font-display text-3xl text-[#1A1A18] mb-4">
            Settore non trovato
          </h1>
          <Link to="/" className="text-[#1B4332] text-sm hover:underline">
            Torna alla home →
          </Link>
        </div>
      </div>
    )
  }

  const sectorProjects = PROJECTS.filter((p) => p.sectorId === id)

  return (
    <div className="bg-[#F7F5F0]">
      {/* HERO */}
      <section className="relative h-[70vh] flex items-end pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={resolveImageUrl(
              {
                src: sector.heroImage,
                publicId: sector.heroImageCloudinaryPublicId ?? null,
              },
              {
                width: 2400,
                height: 1600,
                objectFit: "cover",
                gravity: "auto",
              },
            )}
            alt={sector.label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A18]/80 via-[#1A1A18]/30 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <Link
            to="/"
            className="text-white/60 text-xs mb-6 inline-block hover:text-white transition-colors"
          >
            ← Home
          </Link>
          <span className="block text-[#B5965A] text-xs font-semibold tracking-widest uppercase mb-3">
            Settore
          </span>
          <h1 className="font-display text-5xl lg:text-6xl font-light text-white">
            Arredi per
            <br />
            {sector.label}
          </h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="font-display text-3xl lg:text-4xl font-light text-[#1A1A18] mb-6">
              Cosa realizziamo per
              <br />
              <em className="text-[#1B4332]">{sector.label.toLowerCase()}</em>
            </h2>
            <p className="text-[#4A4A46] leading-relaxed mb-8">
              {sector.description}
            </p>
            <Link
              to="/preventivo"
              className="inline-flex items-center bg-[#1B4332] text-white text-sm font-medium px-6 py-3.5 hover:bg-[#143326] transition-colors"
            >
              Richiedi un preventivo gratuito →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {sector.items.map((item) => (
              <div
                key={item}
                className="bg-white border border-[#DDD9D0] px-4 py-3 text-sm text-[#4A4A46] flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B5965A] flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      {sectorProjects.length > 0 && (
        <section className="py-16 bg-[#1A1A18]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="mb-12">
              <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">
                Realizzazioni
              </span>
              <h2 className="font-display text-3xl lg:text-4xl font-light text-white mt-2">
                Progetti per {sector.label}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sectorProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/progetti/${p.id}`}
                  className="group bg-[#252523] overflow-hidden hover:bg-[#2D2D2B] transition-colors"
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-light text-white mb-1">
                      {p.title}
                    </h3>
                    <p className="text-[#888580] text-xs mb-3">
                      {p.location} · {p.year}
                    </p>
                    <span className="text-[#B5965A] text-xs font-medium group-hover:tracking-widest transition-all">
                      Vedi progetto →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW WE WORK */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">
            Il processo
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-light text-[#1A1A18] mt-2">
            Come lavoriamo
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="border-t-2 border-[#1B4332] pt-6">
              <span className="font-mono text-[#B5965A] text-sm mb-3 block">
                {s.n}
              </span>
              <h3 className="font-display text-xl font-medium text-[#1A1A18] mb-2">
                {s.label}
              </h3>
              <p className="text-[#888580] text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="py-16 bg-[#EAE7E0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-display text-2xl font-light text-[#1A1A18] mb-8 text-center">
            Perché sceglierci per i tuoi {sector.label.toLowerCase()}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              [
                "Esperienza settoriale",
                "Conosciamo le esigenze specifiche del settore per proporti le soluzioni più efficaci.",
              ],
              [
                "Personalizzazione totale",
                "Nessun catalogo, nessun compromesso. Ogni arredo nasce sulle tue misure e il tuo stile.",
              ],
              [
                "Assistenza post-vendita",
                "Siamo presenti anche dopo la consegna per qualsiasi manutenzione o adeguamento.",
              ],
            ].map(([t, d]) => (
              <div key={t} className="bg-white p-6 border-l-2 border-[#1B4332]">
                <h3 className="font-display text-lg font-medium text-[#1A1A18] mb-2">
                  {t}
                </h3>
                <p className="text-[#888580] text-sm leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1B4332] text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-4xl font-light text-white mb-4">
            Parla con un progettista
          </h2>
          <p className="text-white/70 mb-8">
            Raccontaci il tuo progetto: ti ricontatteremo entro 24 ore per
            fissare un sopralluogo gratuito.
          </p>
          <Link
            to={`/preventivo?settore=${id}`}
            className="inline-flex items-center bg-white text-[#1B4332] text-sm font-semibold px-8 py-4 hover:bg-[#F7F5F0] transition-colors"
          >
            Richiedi preventivo per {sector.label} →
          </Link>
        </div>
      </section>
    </div>
  )
}
