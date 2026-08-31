import { useState } from "react"

export default function Contacts() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ nome: "", email: "", messaggio: "" })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

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
              {[
                {
                  label: "Indirizzo",
                  lines: [
                    "Via P. Vertaldi, 27",
                    "81050 Macerata Campania (CE)",
                  ],
                },
                {
                  label: "Telefono",
                  lines: ["+39 0823 694427", "+39 329 4576079 (WhatsApp)"],
                },
                {
                  label: "Email",
                  lines: ["farcomsrl@hotmail.com"],
                },
                {
                  label: "Orari",
                  lines: [
                    "Lun–Ven 9:00–13:00 / 15:00–19:00",
                    "Sab su appuntamento",
                  ],
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white border border-[#DDD9D0] p-5"
                >
                  <div className="text-xs text-[#888580] uppercase tracking-widest mb-2">
                    {item.label}
                  </div>
                  {item.lines.map((l, i) => (
                    <div key={i} className="text-[#1A1A18] text-sm font-medium">
                      {l}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="relative bg-[#EAE7E0] h-72 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1597960194599-22929afc25b1?w=700&h=400&fit=crop&auto=format"
                alt="Farcom Srl - Macerata Campania"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-[#E69138] text-white px-6 py-3 text-sm font-medium">
                  📍 Via P. Vertaldi, 27 — Macerata Campania (CE)
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="mt-8 flex gap-4">
              {[
                {
                  label: "Instagram",
                  href: "https://www.instagram.com/farcom_arredi/",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  ),
                },
                {
                  label: "Facebook",
                  href: "https://www.facebook.com/p/Farcom-arredi-100054867935352/",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                },
              ].map(({ label, href, icon }) => (
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
                href="https://wa.me/393294576079"
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
                Scrivici su WhatsApp
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
