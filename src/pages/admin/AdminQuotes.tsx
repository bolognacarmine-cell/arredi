import { useState } from "react"

const quotes = [
  {
    id: 1,
    nome: "Luca Bernardi",
    cognome: "Bernardi",
    azienda: "Barberia Moderna",
    settore: "Barbieri",
    email: "luca.b@email.it",
    telefono: "333 1234567",
    data: "24/08/2025",
    stato: "nuovo",
    metratura: "45",
    arredo: "Banco reception, 3 postazioni taglio, zona attesa",
    messaggio:
      "Sto aprendo un nuovo barbershop a Milano, in zona Navigli. Ho già un locale di circa 45mq. Ho bisogno di un'idea completa.",
  },
  {
    id: 2,
    nome: "Marta Vitali",
    cognome: "Vitali",
    azienda: "Studio V Architettura",
    settore: "Uffici",
    email: "m.vitali@studiov.it",
    telefono: "02 9876543",
    data: "23/08/2025",
    stato: "contattato",
    metratura: "120",
    arredo: "Reception, sala riunioni, 6 postazioni",
    messaggio:
      "Nuovo ufficio al quarto piano, edificio ristrutturato. Vogliamo uno stile minimal e funzionale.",
  },
  {
    id: 3,
    nome: "Roberto Greco",
    cognome: "Greco",
    azienda: "Boutique Greco",
    settore: "Negozi",
    email: "r.greco@boutique.it",
    telefono: "055 7654321",
    data: "21/08/2025",
    stato: "contattato",
    metratura: "60",
    arredo: "Espositori, banco cassa, camerini",
    messaggio:
      "Abbigliamento donna luxury, Firenze centro storico. Budget non è il primo criterio.",
  },
  {
    id: 4,
    nome: "Istituto Pacinotti",
    cognome: "",
    azienda: "Istituto Tecnico Pacinotti",
    settore: "Scuole",
    email: "segreteria@pacinotti.edu.it",
    telefono: "051 456789",
    data: "19/08/2025",
    stato: "chiuso",
    metratura: "400",
    arredo: "20 aule, mensa, biblioteca",
    messaggio:
      "Ristrutturazione completa. Gara d'appalto vinta. Procedere con la progettazione.",
  },
  {
    id: 5,
    nome: "Federica Amato",
    cognome: "Amato",
    azienda: "Amato Hair Studio",
    settore: "Barbieri",
    email: "f.amato@hair.it",
    telefono: "349 8765432",
    data: "17/08/2025",
    stato: "nuovo",
    metratura: "30",
    arredo: "3 postazioni, banco shampoo, reception",
    messaggio: "",
  },
]

const statusColor: Record<string, string> = {
  nuovo: "bg-blue-100 text-blue-700",
  contattato: "bg-amber-100 text-amber-700",
  chiuso: "bg-green-100 text-green-700",
}

const statuses = ["nuovo", "contattato", "chiuso"]

export default function AdminQuotes() {
  const [filter, setFilter] = useState("all")
  const [selected, setSelected] = useState<typeof quotes[0] | null>(null)
  const [nota, setNota] = useState("")

  const filtered =
    filter === "all" ? quotes : quotes.filter((q) => q.stato === filter)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-light text-[#1A1A18]">
          Preventivi & Lead
        </h1>
        <p className="text-[#888580] text-sm mt-0.5">
          {quotes.length} richieste totali
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5">
        {[
          ["all", "Tutti"],
          ...statuses.map((s) => [s, s.charAt(0).toUpperCase() + s.slice(1)]),
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              filter === k
                ? "bg-[#1B4332] text-white"
                : "bg-white border border-[#DDD9D0] text-[#4A4A46] hover:border-[#1B4332]"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div
        className={`grid gap-5 ${selected ? "lg:grid-cols-[1fr_360px]" : ""}`}
      >
        {/* Table */}
        <div className="bg-white border border-[#DDD9D0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F5F0] text-[#888580] text-xs uppercase tracking-wide border-b border-[#DDD9D0]">
                <th className="text-left px-5 py-3">Contatto</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">
                  Settore
                </th>
                <th className="text-left px-5 py-3 hidden md:table-cell">
                  Data
                </th>
                <th className="text-left px-5 py-3">Stato</th>
                <th className="text-left px-5 py-3">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => setSelected(q)}
                  className={`border-t border-[#EAE7E0] cursor-pointer transition-colors ${
                    selected?.id === q.id
                      ? "bg-[#EAE7E0]"
                      : "hover:bg-[#F7F5F0]"
                  }`}
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#1A1A18]">
                      {q.nome} {q.cognome}
                    </div>
                    <div className="text-[#888580] text-xs">{q.azienda}</div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell text-[#4A4A46] text-xs">
                    {q.settore}
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-[#888580] text-xs">
                    {q.data}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 font-medium rounded-full ${statusColor[q.stato]}`}
                    >
                      {q.stato}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(q)
                      }}
                      className="text-xs text-[#1B4332] hover:underline"
                    >
                      Dettaglio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="bg-white border border-[#DDD9D0] p-6 h-fit">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-light text-[#1A1A18]">
                {selected.nome} {selected.cognome}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-[#888580] text-xs hover:text-[#1A1A18]"
              >
                ✕
              </button>
            </div>

            <dl className="space-y-3 text-sm mb-5">
              {[
                ["Azienda", selected.azienda || "—"],
                ["Settore", selected.settore],
                ["Email", selected.email],
                ["Telefono", selected.telefono],
                ["Data richiesta", selected.data],
                [
                  "Metratura",
                  selected.metratura ? `${selected.metratura} m²` : "—",
                ],
                ["Arredi richiesti", selected.arredo || "—"],
              ].map(([l, v]) => (
                <div
                  key={l as string}
                  className="border-b border-[#EAE7E0] pb-2.5 last:border-0"
                >
                  <dt className="text-[#888580] text-xs uppercase tracking-wide mb-0.5">
                    {l}
                  </dt>
                  <dd className="text-[#1A1A18] font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            {selected.messaggio && (
              <div className="bg-[#F7F5F0] p-4 mb-5 text-sm text-[#4A4A46] leading-relaxed">
                "{selected.messaggio}"
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
                Cambia stato
              </label>
              <div className="flex gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      selected.stato === s
                        ? "border-[#1B4332] bg-[#1B4332] text-white"
                        : "border-[#DDD9D0] text-[#4A4A46] hover:border-[#1B4332]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
                Note interne
              </label>
              <textarea
                rows={3}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Aggiungi una nota..."
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] resize-none"
              />
              <button className="mt-2 bg-[#1B4332] text-white text-xs font-medium px-4 py-2 hover:bg-[#143326] transition-colors">
                Salva nota
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
