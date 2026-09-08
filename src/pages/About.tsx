import { useEffect } from "react"
import { Link } from "react-router-dom"

export default function About() {
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)
  }, [])

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
              Farcom S.r.l.
              <br />
              <em className="text-[#1B4332]">dal 2003</em>
            </h1>
            <p className="text-[#4A4A46] leading-relaxed mb-6 text-base">
              Farcom S.r.l. è un punto di riferimento nel settore degli arredi
              per attività commerciali e professionali. Specializzati in
              soluzioni per barbieri, uffici, negozi, scuole, bar e centri
              estetici, continuiamo a crescere adattandoci alle nuove esigenze
              del mercato con proposte sempre più evolute.
            </p>
            <p className="text-[#4A4A46] leading-relaxed mb-6 text-base">
              Investiamo in innovazione e design collaborando con professionisti
              del settore per sviluppare prodotti all'avanguardia. La rapidità
              nella consegna e la qualità dei materiali sono i pilastri della
              nostra offerta: ogni progetto nasce per creare ambienti
              funzionali e accoglienti che rispondano alle esigenze specifiche
              dei nostri clienti.
            </p>
            <p className="text-[#4A4A46] leading-relaxed text-base">
              Ci distinguiamo per l'attenzione al cliente: offriamo consulenze
              personalizzate e un servizio di assistenza post-vendita completo,
              perché per noi ogni spazio ha la sua storia da raccontare.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1547609434-b732edfee020?w=700&h=800&fit=crop&auto=format"
              alt="Il nostro laboratorio"
              className="w-full object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-[#1B4332] text-white p-6 hidden lg:block">
              <div className="font-display text-4xl font-light mb-1">2003</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">
                Fondazione a Macerata Campania
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-20 bg-[#1A1A18]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-display text-3xl lg:text-4xl font-light text-white mb-12 text-center">
            I nostri punti di forza
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              [
                "Innovazione e design",
                "Collaboriamo con professionisti del settore per sviluppare prodotti all'avanguardia e soluzioni moderne.",
              ],
              [
                "Qualità dei materiali",
                "Selezioniamo solo materiali certificati e duraturi per garantire arredi che resistono nel tempo.",
              ],
              [
                "Servizio personalizzato",
                "Offriamo consulenze su misura e assistenza post-vendita completa per ogni cliente.",
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

      {/* TIMELINE */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">
            La nostra storia
          </span>
          <h2 className="font-display text-4xl font-light text-[#1A1A18] mt-2">
            Dal 2003 a oggi
          </h2>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="border-l-2 border-[#B5965A] pl-8">
            <div className="mb-8">
              <div className="font-display text-3xl font-light text-[#1B4332] mb-2">
                2003
              </div>
              <div className="text-[#888580] text-sm mb-3">Fondazione</div>
              <p className="text-[#4A4A46] leading-relaxed">
                Farcom S.r.l. viene fondata a Macerata Campania con l'obiettivo
                di fornire arredi di alta qualità e soluzioni personalizzate per
                il settore.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1B4332] text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-3xl font-light text-white mb-4">
            Parliamo del tuo progetto
          </h2>
          <p className="text-white/70 mb-8 text-sm">
            Raccontaci le tue esigenze: ti ricontatteremo per una consulenza
            personalizzata.
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
