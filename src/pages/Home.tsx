import { Link } from "react-router-dom";
import { SECTORS, PROJECTS } from "../data";
import HeroBackgroundVideo from "../components/HeroBackgroundVideo";

const services = [
  { title: "Progettazione", desc: "Ascoltiamo le tue esigenze e trasformiamo l'idea in un progetto tecnico dettagliato, con render 3D e disegni costruttivi.", icon: "✦" },
  { title: "Realizzazione", desc: "Produzione artigianale nel nostro laboratorio a Bologna, con materiali selezionati e lavorazioni a regola d'arte.", icon: "◈" },
  { title: "Installazione", desc: "Posa in opera rapida e precisa da parte del nostro team. Rispettiamo i tempi concordati e lasciamo il cantiere pulito.", icon: "⬡" },
  { title: "Post-vendita", desc: "Supporto e manutenzione nel tempo. Gli arredi su misura meritano cura: siamo presenti anche dopo la consegna.", icon: "◇" },
];

const whys = [
  { label: "25 anni di esperienza", value: "Dal 1999 realizziamo arredi per professionisti esigenti." },
  { label: "100% made in Italy", value: "Ogni pezzo è progettato e costruito nel nostro laboratorio di Bologna." },
  { label: "Materiali certificati", value: "Legni FSC, vernici a bassa emissione, ferramenta di qualità superiore." },
  { label: "Tempi certi", value: "Consegnamo nei tempi pattuiti. Sempre. È una questione di rispetto." },
];

export default function Home() {
  return (
    <div className="bg-[#F7F5F0]">
      {/* HERO */}
      <section className="relative min-h-screen flex items-end pb-20 overflow-hidden bg-black">
        {/* Video background (componente già absolute inset-0 autosufficiente) */}
        <HeroBackgroundVideo
          className="z-0"
          basePath="/videos/farcom-hero"
          poster="https://images.unsplash.com/photo-1547609434-b732edfee020?w=1920&h=1080&fit=crop&auto=format"
          fallbackImg="https://images.unsplash.com/photo-1547609434-b732edfee020?w=2560&h=1440&fit=crop&auto=format"
          priority
        />
        {/* Overlay SINGOLO: sopra il video (z-1), sotto i testi (z-10). Preserva colori video + leggibilità testo */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,14,22,0.25) 0%, rgba(10,14,22,0.15) 35%, rgba(10,14,22,0.60) 72%, rgba(26,26,24,0.92) 100%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <div className="max-w-3xl">
            <span className="inline-block text-[#B5965A] text-xs font-semibold tracking-widest uppercase mb-6">
              Arredo su misura
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1] mb-6">
              Arredi su misura per barbieri, uffici, negozi e scuole
            </h1>
            <p className="text-[#DDD9D0] text-lg font-light max-w-xl mb-10 leading-relaxed">
              Progettiamo e realizziamo ogni pezzo nel nostro laboratorio artigianale. Dal sopralluogo alla posa in opera: un interlocutore unico per uno spazio perfetto.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/preventivo"
                className="inline-flex items-center bg-[#1B4332] text-white text-sm font-medium px-7 py-4 hover:bg-[#143326] transition-colors"
              >
                Richiedi un sopralluogo gratuito
              </Link>
              <Link
                to="/progetti"
                className="inline-flex items-center border border-white/40 text-white text-sm font-medium px-7 py-4 hover:bg-white/10 transition-colors"
              >
                Vedi i progetti
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-10 hidden lg:flex items-center gap-3 text-white/40 text-xs">
          <span className="w-12 h-px bg-white/20" />
          <span>Scroll per scoprire</span>
        </div>
      </section>

      {/* SECTORS */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">Settori di attività</span>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-[#1A1A18] mt-2">
              Ogni spazio ha la sua<br />
              <em className="text-[#1B4332]">storia da raccontare</em>
            </h2>
          </div>
          <p className="text-[#888580] max-w-xs text-sm leading-relaxed">
            Quattro settori, un'unica filosofia: progettazione attenta, materiali di qualità, esecuzione impeccabile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTORS.map((s) => (
            <Link
              key={s.id}
              to={`/settori/${s.id}`}
              className="group relative overflow-hidden bg-[#EAE7E0] aspect-[3/4] flex flex-col justify-end p-6 hover:shadow-xl transition-shadow"
            >
              <div className="absolute inset-0">
                <img
                  src={s.heroImage}
                  alt={s.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="relative z-10">
                <h3 className="font-display text-xl font-light text-white mb-2">{s.label}</h3>
                <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-4">{s.description}</p>
                <span className="text-[#B5965A] text-xs font-medium tracking-wide group-hover:tracking-widest transition-all">
                  Scopri di più →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="py-20 bg-[#1A1A18]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">Portfolio</span>
              <h2 className="font-display text-4xl lg:text-5xl font-light text-white mt-2">
                Progetti in evidenza
              </h2>
            </div>
            <Link to="/progetti" className="text-[#B5965A] text-sm font-medium hover:underline">
              Vedi tutti i progetti →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROJECTS.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to={`/progetti/${p.id}`}
                className="group bg-[#252523] overflow-hidden hover:bg-[#2D2D2B] transition-colors"
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 bg-[#1B4332] text-white text-xs px-3 py-1 font-medium">
                    {p.sectorId.charAt(0).toUpperCase() + p.sectorId.slice(1)}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-light text-white mb-1">{p.title}</h3>
                  <p className="text-[#888580] text-xs mb-3">{p.location} · {p.year}</p>
                  <p className="text-[#888580] text-sm leading-relaxed line-clamp-2">{p.description}</p>
                  <span className="mt-4 inline-block text-[#B5965A] text-xs font-medium tracking-wide group-hover:tracking-widest transition-all">
                    Vedi progetto →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">Come lavoriamo</span>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-[#1A1A18] mt-2">
            Il nostro processo
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((svc, i) => (
            <div key={svc.title} className="flex flex-col">
              <div className="flex items-center gap-4 mb-5">
                <span className="text-[#B5965A] text-2xl">{svc.icon}</span>
                <span className="w-8 h-px bg-[#DDD9D0]" />
                <span className="text-[#DDD9D0] text-xs font-mono">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-display text-xl font-medium text-[#1A1A18] mb-3">{svc.title}</h3>
              <p className="text-[#888580] text-sm leading-relaxed">{svc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 bg-[#1B4332]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="text-[#B5965A] text-xs tracking-widest uppercase font-semibold">Perché sceglierci</span>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-white mt-2">
              La differenza artigianale
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whys.map((w) => (
              <div key={w.label} className="border-t border-white/20 pt-6">
                <h3 className="font-display text-xl font-light text-white mb-3">{w.label}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{w.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-16 bg-[#EAE7E0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            ["500+", "Progetti realizzati"],
            ["25", "Anni di attività"],
            ["4", "Settori serviti"],
            ["98%", "Clienti soddisfatti"],
          ].map(([n, l]) => (
            <div key={n}>
              <div className="font-display text-5xl font-light text-[#1B4332] mb-2">{n}</div>
              <div className="text-[#888580] text-sm">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-[#1A1A18] max-w-xl">
            Hai un'idea per il tuo spazio?<br />
            <em className="text-[#1B4332]">Parliamone.</em>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/preventivo"
            className="inline-flex items-center bg-[#1B4332] text-white text-sm font-medium px-7 py-4 hover:bg-[#143326] transition-colors"
          >
            Richiedi un preventivo gratuito
          </Link>
          <Link
            to="/contatti"
            className="inline-flex items-center border border-[#1B4332] text-[#1B4332] text-sm font-medium px-7 py-4 hover:bg-[#1B4332]/5 transition-colors"
          >
            Contattaci
          </Link>
        </div>
      </section>
    </div>
  );
}
