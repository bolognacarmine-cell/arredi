import { Link } from "react-router-dom"

const steps = [
  {
    n: "01",
    t: "Ascolto",
    d: "Veniamo da te, vediamo lo spazio e ascoltiamo ogni esigenza.",
  },
  {
    n: "02",
    t: "Progetto",
    d: "Sviluppiamo render 3D e disegni tecnici personalizzati.",
  },
  {
    n: "03",
    t: "Produzione",
    d: "Realizziamo nel nostro laboratorio a Bologna, con cura artigianale.",
  },
  {
    n: "04",
    t: "Consegna",
    d: "Installiamo noi, nei tempi pattuiti. Spazio pronto all'uso.",
  },
  {
    n: "05",
    t: "Supporto",
    d: "Siamo disponibili anche dopo per ogni manutenzione.",
  },
]

export default function About() {
  return (
    <div className="bg-[#F7F5F0] min-h-screen pt-24">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">
              Chi siamo
            </span>
            <h1 className="font-display text-5xl lg:text-6xl font-light text-[#1A1A18] mt-2 mb-6 leading-tight">
              Artigiani del legno
              <br />
              <em className="text-[#1B4332]">dal 1999</em>
            </h1>
            <p className="text-[#4A4A46] leading-relaxed mb-6 text-base">
              ArtigianaLegno nasce a Bologna nel 1999 dalla passione di Marco e
              Giulia Ferretti per il legno e per gli spazi vissuti. Ciò che è
              iniziato come un piccolo laboratorio di tre persone è oggi
              un'azienda di 24 artigiani specializzati, con clienti in tutta
              Italia.
            </p>
            <p className="text-[#4A4A46] leading-relaxed mb-6 text-base">
              La nostra filosofia è semplice: nessun catalogo, nessun pezzo
              standard. Ogni arredo che lascia il nostro laboratorio è pensato
              per uno spazio specifico, per un cliente specifico. È questo che
              intendiamo con "su misura".
            </p>
            <p className="text-[#4A4A46] leading-relaxed text-base">
              Lavoriamo principalmente con barbieri, parrucchieri, studi
              professionali, negozi e istituti scolastici: contesti esigenti,
              dove l'arredo non è solo estetica ma funzione, durabilità e
              identità.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1547609434-b732edfee020?w=700&h=800&fit=crop&auto=format"
              alt="Il nostro laboratorio"
              className="w-full object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-[#1B4332] text-white p-6 hidden lg:block">
              <div className="font-display text-4xl font-light mb-1">25</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">
                anni di attività
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-20 bg-[#1A1A18]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-display text-3xl lg:text-4xl font-light text-white mb-12 text-center">
            I nostri valori
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              [
                "Cura del dettaglio",
                "Ogni giunzione, ogni finitura, ogni angolo è curato come se fosse la nostra firma. Perché lo è.",
              ],
              [
                "Rispetto dei tempi",
                "I tempi di consegna sono sacri. Un cantiere fermo costa denaro: lo sappiamo e lo rispettiamo.",
              ],
              [
                "Materiali onesti",
                "Usiamo solo materiali che possiamo garantire nel tempo: legni masselli, laminati di qualità, ferramenta tedesca.",
              ],
            ].map(([t, d]) => (
              <div key={t as string} className="border-l border-[#B5965A] pl-6">
                <h3 className="font-display text-xl font-light text-white mb-3">
                  {t}
                </h3>
                <p className="text-[#888580] text-sm leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">
            Il metodo
          </span>
          <h2 className="font-display text-4xl font-light text-[#1A1A18] mt-2">
            Come lavoriamo, passo per passo
          </h2>
        </div>
        <div className="relative">
          <div className="absolute top-5 left-5 right-5 h-px bg-[#DDD9D0] hidden lg:block" />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="relative text-center">
                <div className="w-10 h-10 bg-[#1B4332] text-white text-xs font-mono flex items-center justify-center mx-auto mb-4 relative z-10">
                  {s.n}
                </div>
                <h3 className="font-display text-lg font-medium text-[#1A1A18] mb-2">
                  {s.t}
                </h3>
                <p className="text-[#888580] text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM PLACEHOLDER */}
      <section className="py-16 bg-[#EAE7E0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-display text-3xl font-light text-[#1A1A18] mb-8">
            Il team
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              [
                "Marco Ferretti",
                "Fondatore & progettista",
                "https://images.unsplash.com/photo-1611021061285-16c871740efa?w=300&h=300&fit=crop&auto=format",
              ],
              [
                "Giulia Ferretti",
                "Co-fondatrice & design",
                "https://images.unsplash.com/photo-1547609434-b732edfee020?w=300&h=300&fit=crop&auto=format",
              ],
              [
                "Luca Bianchi",
                "Responsabile produzione",
                "https://images.unsplash.com/photo-1597960194599-22929afc25b1?w=300&h=300&fit=crop&auto=format",
              ],
              [
                "Sara Moretti",
                "Progettista CAD",
                "https://images.unsplash.com/photo-1715593949273-09009558300a?w=300&h=300&fit=crop&auto=format",
              ],
              [
                "Paolo Rossi",
                "Capo installatori",
                "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=300&fit=crop&auto=format",
              ],
              [
                "Anna Conti",
                "Commerciale",
                "https://images.unsplash.com/photo-1704655295066-681e61ecca6b?w=300&h=300&fit=crop&auto=format",
              ],
            ].map(([name, role, img]) => (
              <div key={name as string} className="text-center">
                <div className="w-full aspect-square bg-[#DDD9D0] overflow-hidden mb-3">
                  <img
                    src={img as string}
                    alt={name as string}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <div className="font-medium text-[#1A1A18] text-sm">{name}</div>
                <div className="text-[#888580] text-xs mt-0.5">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="py-14 max-w-7xl mx-auto px-6 lg:px-10">
        <h2 className="font-display text-2xl font-light text-[#1A1A18] mb-8 text-center">
          Certificazioni e partner
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {[
            "FSC Certified Wood",
            "ISO 9001:2015",
            "CNA Artigiani",
            "Confartigianato",
            "Marchio CE",
          ].map((cert) => (
            <div
              key={cert}
              className="border border-[#DDD9D0] px-6 py-3 text-sm text-[#888580] font-medium"
            >
              {cert}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1B4332] text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-3xl font-light text-white mb-4">
            Vieni a trovarci
          </h2>
          <p className="text-white/70 mb-8 text-sm">
            Laboratorio e showroom a Bologna. Aperto su appuntamento dal lunedì
            al venerdì.
          </p>
          <Link
            to="/contatti"
            className="inline-flex items-center bg-white text-[#1B4332] text-sm font-semibold px-8 py-4 hover:bg-[#F7F5F0] transition-colors"
          >
            Contattaci →
          </Link>
        </div>
      </section>
    </div>
  )
}
