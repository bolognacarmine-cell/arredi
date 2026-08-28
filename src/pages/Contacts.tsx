import { useState } from "react";

export default function Contacts() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", messaggio: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="bg-[#F7F5F0] min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="mb-12">
          <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">Dove siamo</span>
          <h1 className="font-display text-5xl font-light text-[#1A1A18] mt-2">Contatti</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {[
                { label: "Indirizzo", lines: ["Via dell'Artigiano, 14", "40128 Bologna (BO)"] },
                { label: "Telefono", lines: ["+39 051 234 5678", "+39 345 678 9012 (WhatsApp)"] },
                { label: "Email", lines: ["info@artigianalegno.it", "preventivi@artigianalegno.it"] },
                { label: "Orari", lines: ["Lun–Ven 8:30–18:00", "Sab su appuntamento"] },
              ].map((item) => (
                <div key={item.label} className="bg-white border border-[#DDD9D0] p-5">
                  <div className="text-xs text-[#888580] uppercase tracking-widest mb-2">{item.label}</div>
                  {item.lines.map((l, i) => (
                    <div key={i} className="text-[#1A1A18] text-sm font-medium">{l}</div>
                  ))}
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="relative bg-[#EAE7E0] h-72 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1597960194599-22929afc25b1?w=700&h=400&fit=crop&auto=format"
                alt="Laboratorio ArtigianaLegno - Bologna"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-[#1B4332] text-white px-6 py-3 text-sm font-medium">
                  📍 Via dell'Artigiano, 14 — Bologna
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="mt-8 flex gap-4">
              {[
                ["Instagram", "instagram.com"],
                ["Facebook", "facebook.com"],
                ["LinkedIn", "linkedin.com"],
                ["WhatsApp", "wa.me"],
              ].map(([label]) => (
                <a
                  key={label as string}
                  href="#"
                  className="border border-[#DDD9D0] text-[#4A4A46] text-xs px-4 py-2.5 hover:border-[#1B4332] hover:text-[#1B4332] transition-colors font-medium"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="font-display text-2xl font-light text-[#1A1A18] mb-6">Scrivici</h2>

            {sent ? (
              <div className="bg-[#1B4332] text-white p-8">
                <div className="text-2xl mb-3">✓</div>
                <h3 className="font-display text-xl font-light mb-2">Messaggio inviato</h3>
                <p className="text-white/70 text-sm">Ti risponderemo entro un giorno lavorativo.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                className="space-y-5"
              >
                {[
                  ["nome", "Nome e cognome *", "text"],
                  ["email", "Email *", "email"],
                ].map(([k, label, type]) => (
                  <div key={k as string}>
                    <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">{label}</label>
                    <input
                      type={type as string}
                      required
                      value={form[k as keyof typeof form]}
                      onChange={(e) => set(k as string, e.target.value)}
                      className="w-full border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">Messaggio *</label>
                  <textarea
                    rows={6}
                    required
                    value={form.messaggio}
                    onChange={(e) => set("messaggio", e.target.value)}
                    className="w-full border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#1B4332] text-white text-sm font-medium px-8 py-3.5 hover:bg-[#143326] transition-colors"
                >
                  Invia messaggio
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
