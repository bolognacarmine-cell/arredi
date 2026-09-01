import { useState } from "react"
import {
  getContactInfoCards,
  getSocialLinks,
  useSiteSettings,
} from "../siteConfig"

export default function Contacts() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ nome: "", email: "", messaggio: "" })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const siteConfig = useSiteSettings()
  const contactInfoCards = getContactInfoCards(siteConfig)
  const socialLinks = getSocialLinks(siteConfig)

  return (
    <div className="bg-[#F7F5F0] min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="mb-12">
          <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">
            Dove siamo
          </span>
          <h1 className="font-display text-5xl font-light text-[#1A1A18] mt-2">
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
                  className="bg-white border border-[#DDD9D0] p-5"
                >
                  <div className="text-xs text-[#888580] uppercase tracking-widest mb-2">
                    {item.label}
                  </div>
                  {item.entries.map(({ text, href, external }, i) =>
                    href ? (
                      <a
                        key={`${item.label}-${i}`}
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="block text-[#1A1A18] text-sm font-medium hover:text-[#E69138] transition-colors"
                      >
                        {text}
                      </a>
                    ) : (
                      <div
                        key={`${item.label}-${i}`}
                        className="text-[#1A1A18] text-sm font-medium"
                      >
                        {text}
                      </div>
                    ),
                  )}
                </div>
              ))}
            </div>

            {/* Google Maps */}
            <div className="relative bg-[#EAE7E0] h-72 overflow-hidden">
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
                  className="border border-[#DDD9D0] text-[#4A4A46] text-xs px-4 py-2.5 hover:border-[#E69138] hover:text-[#E69138] transition-colors font-medium flex items-center gap-2"
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
            <h2 className="font-display text-2xl font-light text-[#1A1A18] mb-6">
              Scrivici
            </h2>

            {sent ? (
              <div className="bg-[#E69138] text-white p-8">
                <div className="text-2xl mb-3">✓</div>
                <h3 className="font-display text-xl font-light mb-2">
                  Messaggio inviato
                </h3>
                <p className="text-white/70 text-sm">
                  Ti risponderemo entro un giorno lavorativo.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSent(true)
                }}
                className="space-y-5"
              >
                {[
                  ["nome", "Nome e cognome *", "text"],
                  ["email", "Email *", "email"],
                ].map(([k, label, type]) => (
                  <div key={k as string}>
                    <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
                      {label}
                    </label>
                    <input
                      type={type as string}
                      required
                      value={form[(k as keyof typeof form)]}
                      onChange={(e) => set(k as string, e.target.value)}
                      className="w-full border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#1A1A18] focus:outline-none focus:border-[#E69138] transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
                    Messaggio *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={form.messaggio}
                    onChange={(e) => set("messaggio", e.target.value)}
                    className="w-full border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#1A1A18] focus:outline-none focus:border-[#E69138] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#E69138] text-white text-sm font-medium px-8 py-3.5 hover:bg-[#D67F28] transition-colors"
                >
                  Invia messaggio
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
