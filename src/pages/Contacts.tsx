import { useState, useEffect } from "react"
import {
  getContactInfoCards,
  getSocialLinks,
  useSiteSettings,
} from "../siteConfig"
import SEOHead from "../components/SEOHead"

export default function Contacts() {
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

  const [form, setForm] = useState({ nome: "", email: "", telefono: "", messaggio: "" })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const siteConfig = useSiteSettings()
  const contactInfoCards = getContactInfoCards(siteConfig)
  const socialLinks = getSocialLinks(siteConfig)

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-24">
      <SEOHead
        title="Contatti - Farcom Srl | Showroom Macerata Campania"
        description="Contatta Farcom Srl: showroom arredamento a Macerata Campania, Via P. Vertaldi 27. Telefono +39 0823 694427, WhatsApp +39 329 4576079. Arredamento su misura in tutta Italia."
        canonical="https://arredi.onrender.com/contatti"
        schema={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Farcom Srl",
          "description": "Showroom arredamento a Macerata Campania. Arredi su misura per barberie, uffici, negozi e attività professionali con servizio in tutta Italia.",
          "url": "https://arredi.onrender.com/",
          "telephone": "+39 0823 694427",
          "email": "farcomsrl@hotmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Via P. Vertaldi, 27",
            "addressLocality": "Macerata Campania",
            "addressRegion": "CE",
            "postalCode": "81050",
            "addressCountry": "IT"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 41.055439,
            "longitude": 14.2848
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "13:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "15:00",
              "closes": "19:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Saturday",
              "opens": "09:00",
              "closes": "13:00"
            }
          ],
          "areaServed": [
            {
              "@type": "City",
              "name": "Macerata Campania"
            },
            {
              "@type": "City",
              "name": "Caserta"
            },
            {
              "@type": "AdministrativeArea",
              "name": "Campania"
            },
            {
              "@type": "Country",
              "name": "Italia"
            }
          ],
          "sameAs": [
            "https://www.instagram.com/farcom_arredi/",
            "https://www.facebook.com/p/Farcom-arredi-100054867935352/"
          ]
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Dove si trova lo showroom Farcom?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Il nostro showroom si trova a Macerata Campania, in Via P. Vertaldi 27. Siamo facilmente raggiungibili da Caserta e provincia."
                }
              },
              {
                "@type": "Question",
                "name": "Farcom lavora solo in Campania o anche in altre regioni?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Farcom Srl ha sede a Macerata Campania ma offre servizio di arredamento e progettazione interni in tutta Italia. Operiamo a livello nazionale con la stessa qualità artigianale."
                }
              },
              {
                "@type": "Question",
                "name": "Posso visitare il showroom senza appuntamento?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ti consigliamo di contattarci prima per fissare un appuntamento e assicurarti che un nostro consulente sia disponibile per darti tutta l'attenzione necessaria."
                }
              },
              {
                "@type": "Question",
                "name": "Quali sono gli orari di apertura?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Siamo aperti dal lunedì al venerdì: 9:00-13:00 / 15:00-19:00. Sabato: 9:00-13:00. Domenica chiusi."
                }
              }
            ]
          })
        }}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="mb-12">
          <span className="text-[#6B7280] text-xs tracking-widest uppercase font-semibold">
            Dove siamo
          </span>
          <h1 className="font-display text-5xl font-light text-[#1A1A2E] mt-2">
            Contatti
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {contactInfoCards.map((item) => (
                <div
                  key={item.label}
                  className="bg-white border border-[#E5E5E7] p-5"
                >
                  <div className="text-xs text-[#6B7280] uppercase tracking-widest mb-2">
                    {item.label}
                  </div>
                  {item.entries.map(({ text, href, external }, i) =>
                    href ? (
                      <a
                        key={`${item.label}-${i}`}
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="block text-[#1A1A2E] text-sm font-medium hover:text-[#E69138] transition-colors"
                      >
                        {text}
                      </a>
                    ) : (
                      <div
                        key={`${item.label}-${i}`}
                        className="text-[#1A1A2E] text-sm font-medium"
                      >
                        {text}
                      </div>
                    ),
                  )}
                </div>
              ))}
            </div>

            {/* Google Maps */}
            <div className="relative bg-[#E8E8EC] h-80 sm:h-96 overflow-hidden">
              <iframe
                src={siteConfig.mapEmbedSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title={siteConfig.mapTitle}
              />
            </div>

            {/* Social */}
            <div className="mt-8 flex gap-4">
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#E5E5E7] text-[#4A4A46] text-xs px-4 py-2.5 hover:border-[#E69138] hover:text-[#E69138] transition-colors font-medium flex items-center gap-2"
                >
                  {icon}
                  {label}
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-6">
              <a
                href={siteConfig.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white text-sm font-semibold px-6 py-3 hover:bg-[#128C7E] transition-colors w-full sm:w-auto justify-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {siteConfig.whatsappLabel}
              </a>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="font-display text-2xl font-light text-[#1A1A2E] mb-6">
              Scrivici
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const telefonoPulito = form.telefono.trim()
                const telefonoMostrato = telefonoPulito || "Non indicato"
                const message = `Nuovo contatto dal sito Arredi

Nome: ${form.nome}
Email: ${form.email}
Telefono: ${telefonoMostrato}

Messaggio:
${form.messaggio}`
                const encodedMessage = encodeURIComponent(message)
                const whatsappUrl = `https://wa.me/393294576079?text=${encodedMessage}`
                window.open(whatsappUrl, "_blank", "noopener,noreferrer")
              }}
              className="space-y-5"
            >
              {[
                ["nome", "Nome e cognome *", "text"],
                ["email", "Email *", "email"],
              ].map(([k, label, type]) => (
                <div key={k as string}>
                  <label className="block text-xs text-[#6B7280] uppercase tracking-wide mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type as string}
                    required
                    value={form[(k as keyof typeof form)]}
                    onChange={(e) => set(k as string, e.target.value)}
                    className="w-full border border-[#E5E5E7] bg-white px-4 py-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#E69138] focus:ring-2 focus:ring-[#E69138]/20 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-[#6B7280] uppercase tracking-wide mb-1.5">
                  Telefono (facoltativo)
                </label>
                <input
                  type="tel"
                  name="telefono"
                  autoComplete="tel"
                  maxLength={25}
                  value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  className="w-full border border-[#E5E5E7] bg-white px-4 py-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#E69138] focus:ring-2 focus:ring-[#E69138]/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] uppercase tracking-wide mb-1.5">
                  Messaggio *
                </label>
                <textarea
                  rows={6}
                  required
                  value={form.messaggio}
                  onChange={(e) => set("messaggio", e.target.value)}
                  className="w-full border border-[#E5E5E7] bg-white px-4 py-3 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#E69138] focus:ring-2 focus:ring-[#E69138]/20 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="bg-[#E69138] text-white text-sm font-medium px-8 py-3.5 hover:bg-[#D67F28] transition-colors"
              >
                Contattaci su WhatsApp
              </button>
              <p className="text-xs text-[#6B7280] mt-3">
                I dati inseriti saranno utilizzati esclusivamente per ricontattarti in merito alla tua richiesta. Consulta la nostra <a href="/privacy" className="text-[#E69138] underline">Informativa privacy</a>.
              </p>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-20 pt-16 border-t border-[#E5E5E7]">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-light text-[#1A1A2E] mb-8 text-center">
              Domande frequenti
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "Dove si trova lo showroom Farcom?",
                  a: "Il nostro showroom si trova a Macerata Campania, in Via P. Vertaldi 27. Siamo facilmente raggiungibili da Caserta e provincia."
                },
                {
                  q: "Farcom lavora solo in Campania o anche in altre regioni?",
                  a: "Farcom Srl ha sede a Macerata Campania ma offre servizio di arredamento e progettazione interni in tutta Italia. Operiamo a livello nazionale con la stessa qualità artigianale."
                },
                {
                  q: "Posso visitare il showroom senza appuntamento?",
                  a: "Ti consigliamo di contattarci prima per fissare un appuntamento e assicurarti che un nostro consulente sia disponibile per darti tutta l'attenzione necessaria."
                },
                {
                  q: "Quali sono gli orari di apertura?",
                  a: "Siamo aperti dal lunedì al venerdì: 9:00-13:00 / 15:00-19:00. Sabato: 9:00-13:00. Domenica chiusi."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white border border-[#E5E5E7] p-6">
                  <h3 className="font-display text-lg font-medium text-[#1A1A2E] mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-[#4A4A46] text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
