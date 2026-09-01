import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { SECTORS } from "../data"

export default function Quote() {
  const [params] = useSearchParams()
  const preselect = params.get("settore") || ""
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    azienda: "",
    email: "",
    telefono: "",
    settore: preselect,
    arredo: "",
    metratura: "",
    messaggio: "",
    privacy: false,
  })

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center pt-20 px-6">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 bg-[#1B4332] flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h1 className="font-display text-3xl font-light text-[#1A1A18] mb-4">
            Richiesta inviata con successo
          </h1>
          <p className="text-[#888580] leading-relaxed mb-8">
            Grazie per la tua richiesta. Il nostro team ti contatterà entro 24
            ore lavorative per discutere il tuo progetto e, se necessario,
            fissare un sopralluogo gratuito.
          </p>
          <Link
            to="/"
            className="inline-flex items-center bg-[#1B4332] text-white text-sm font-medium px-6 py-3.5 hover:bg-[#143326] transition-colors"
          >
            Torna alla home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F7F5F0] min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">
        <div className="mb-12">
          <span className="text-[#888580] text-xs tracking-widest uppercase font-semibold">
            Sopralluogo gratuito
          </span>
          <h1 className="font-display text-5xl font-light text-[#1A1A18] mt-2 mb-4">
            Richiedi un preventivo
          </h1>
          <p className="text-[#888580] max-w-lg leading-relaxed">
            Compila il modulo e ti ricontatteremo entro 24 ore. Il sopralluogo e
            la prima consulenza sono sempre gratuiti e senza impegno.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal */}
          <fieldset>
            <legend className="font-display text-xl font-light text-[#1A1A18] mb-5 pb-3 border-b border-[#DDD9D0] w-full">
              Dati di contatto
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                ["nome", "Nome *", "text", true],
                ["cognome", "Cognome *", "text", true],
                ["azienda", "Azienda / Attività", "text", false],
                ["email", "Email *", "email", true],
                ["telefono", "Telefono *", "tel", true],
              ].map(([k, label, type, req]) => (
                <div
                  key={k as string}
                  className={k === "azienda" ? "sm:col-span-2" : ""}
                >
                  <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
                    {label as string}
                  </label>
                  <input
                    type={type as string}
                    required={req as boolean}
                    value={form[(k as keyof typeof form)] as string}
                    onChange={(e) => set(k as string, e.target.value)}
                    className="w-full border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] transition-colors"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {/* Project */}
          <fieldset>
            <legend className="font-display text-xl font-light text-[#1A1A18] mb-5 pb-3 border-b border-[#DDD9D0] w-full">
              Dettaglio progetto
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
                  Settore *
                </label>
                <select
                  required
                  value={form.settore}
                  onChange={(e) => set("settore", e.target.value)}
                  className="w-full border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] transition-colors"
                >
                  <option value="">Seleziona settore</option>
                  {SECTORS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
                  Metratura approssimativa (m²)
                </label>
                <input
                  type="number"
                  min="5"
                  value={form.metratura}
                  onChange={(e) => set("metratura", e.target.value)}
                  className="w-full border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] transition-colors"
                  placeholder="es. 40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
                  Tipo di arredi richiesti
                </label>
                <input
                  type="text"
                  value={form.arredo}
                  onChange={(e) => set("arredo", e.target.value)}
                  placeholder="es. banco reception, postazioni, specchiere…"
                  className="w-full border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
                  Descrizione del progetto
                </label>
                <textarea
                  rows={5}
                  value={form.messaggio}
                  onChange={(e) => set("messaggio", e.target.value)}
                  placeholder="Raccontaci la tua idea, le dimensioni dello spazio, i materiali preferiti, i tempi previsti…"
                  className="w-full border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] transition-colors resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
                  Allega planimetria / foto (opzionale)
                </label>
                <div className="border border-dashed border-[#DDD9D0] bg-white p-6 text-center text-sm text-[#888580]">
                  <span className="block text-2xl mb-2">📎</span>
                  <span>Trascina qui i file o </span>
                  <label className="text-[#1B4332] underline cursor-pointer">
                    sfoglia
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*,.pdf"
                    />
                  </label>
                  <span className="block text-xs mt-1 text-[#888580]">
                    JPG, PNG, PDF – max 10MB
                  </span>
                </div>
              </div>
            </div>
          </fieldset>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="privacy"
              required
              checked={form.privacy}
              onChange={(e) => set("privacy", e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#1B4332]"
            />
            <label htmlFor="privacy" className="text-sm text-[#4A4A46]">
              Ho letto e accetto la{" "}
              <a href="#" className="text-[#1B4332] underline">
                Privacy Policy
              </a>{" "}
              e acconsento al trattamento dei dati personali per finalità
              commerciali. *
            </label>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-[#1B4332] text-white text-sm font-semibold px-10 py-4 hover:bg-[#143326] transition-colors"
          >
            Invia richiesta
          </button>
        </form>
      </div>
    </div>
  )
}
