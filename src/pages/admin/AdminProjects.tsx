import { useState } from "react"
import { Link } from "react-router-dom"
import { PROJECTS, SECTORS } from "../../data"

const statusColor: Record<string, string> = {
  "in lavorazione": "bg-amber-100 text-amber-700",
  completato: "bg-green-100 text-green-700",
  bozza: "bg-gray-100 text-gray-600",
}

type FormState = {
  titolo: string
  settore: string
  cliente: string
  citta: string
  anno: string
  stato: string
  descrizione: string
  evidenza: boolean
}

const emptyForm: FormState = {
  titolo: "",
  settore: "",
  cliente: "",
  citta: "",
  anno: "2025",
  stato: "bozza",
  descrizione: "",
  evidenza: false,
}

export default function AdminProjects() {
  const [filter, setFilter] = useState("all")
  const [stateFilter, setStateFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  const projects = PROJECTS.map((p) => ({ ...p, stato: "completato" }))
  const filtered = projects
    .filter((p) => filter === "all" || p.sectorId === filter)
    .filter((p) => stateFilter === "all" || p.stato === stateFilter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-light text-[#1A1A18]">
            Progetti
          </h1>
          <p className="text-[#888580] text-sm mt-0.5">
            {projects.length} progetti totali
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1B4332] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#143326] transition-colors"
        >
          + Nuovo progetto
        </button>
      </div>

      {/* New project form */}
      {showForm && (
        <div className="bg-white border border-[#DDD9D0] p-6 mb-6">
          <h2 className="font-display text-xl font-light text-[#1A1A18] mb-5">
            Nuovo progetto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["titolo", "cliente", "citta"] as const).map((k) => (
              <div key={k}>
                <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1">
                  {k}
                </label>
                <input
                  type="text"
                  value={form[k]}
                  onChange={(e) => set(k, e.target.value)}
                  className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1">
                Settore
              </label>
              <select
                value={form.settore}
                onChange={(e) => set("settore", e.target.value)}
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332]"
              >
                <option value="">Seleziona...</option>
                {SECTORS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1">
                Anno
              </label>
              <input
                type="number"
                value={form.anno}
                onChange={(e) => set("anno", e.target.value)}
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1">
                Stato
              </label>
              <select
                value={form.stato}
                onChange={(e) => set("stato", e.target.value)}
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332]"
              >
                <option value="bozza">Bozza</option>
                <option value="in lavorazione">In lavorazione</option>
                <option value="completato">Completato</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1">
                Descrizione
              </label>
              <textarea
                rows={3}
                value={form.descrizione}
                onChange={(e) => set("descrizione", e.target.value)}
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] resize-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="evidenza"
                checked={form.evidenza}
                onChange={(e) => set("evidenza", e.target.checked)}
                className="w-4 h-4 accent-[#1B4332]"
              />
              <label htmlFor="evidenza" className="text-sm text-[#4A4A46]">
                Mostra in evidenza nella home
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowForm(false)}
              className="bg-[#1B4332] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#143326] transition-colors"
            >
              Salva progetto
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border border-[#DDD9D0] text-[#4A4A46] text-sm px-5 py-2.5 hover:bg-[#EAE7E0] transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-[#DDD9D0] bg-white px-4 py-2 text-sm text-[#4A4A46] focus:outline-none focus:border-[#1B4332]"
        >
          <option value="all">Tutti i settori</option>
          {SECTORS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="border border-[#DDD9D0] bg-white px-4 py-2 text-sm text-[#4A4A46] focus:outline-none focus:border-[#1B4332]"
        >
          <option value="all">Tutti gli stati</option>
          <option value="bozza">Bozza</option>
          <option value="in lavorazione">In lavorazione</option>
          <option value="completato">Completato</option>
        </select>
        <span className="text-[#888580] text-xs self-center">
          {filtered.length} risultati
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#DDD9D0] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F7F5F0] text-[#888580] text-xs uppercase tracking-wide border-b border-[#DDD9D0]">
              <th className="text-left px-5 py-3">Progetto</th>
              <th className="text-left px-5 py-3 hidden md:table-cell">
                Settore
              </th>
              <th className="text-left px-5 py-3 hidden lg:table-cell">
                Cliente
              </th>
              <th className="text-left px-5 py-3 hidden sm:table-cell">Anno</th>
              <th className="text-left px-5 py-3">Stato</th>
              <th className="text-left px-5 py-3">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-t border-[#EAE7E0] hover:bg-[#F7F5F0] transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#EAE7E0] flex-shrink-0 overflow-hidden">
                      <img
                        src={p.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-[#1A1A18]">
                      {p.title}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 hidden md:table-cell text-[#4A4A46] text-xs">
                  {p.sector}
                </td>
                <td className="px-5 py-3 hidden lg:table-cell text-[#4A4A46] text-xs">
                  {p.client || "—"}
                </td>
                <td className="px-5 py-3 hidden sm:table-cell text-[#888580] text-xs">
                  {p.year}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2.5 py-1 font-medium rounded-full ${statusColor[p.stato] || "bg-gray-100 text-gray-600"}`}
                  >
                    {p.stato}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-3">
                    <Link
                      to={`/progetti/${p.id}`}
                      target="_blank"
                      className="text-xs text-[#888580] hover:text-[#1B4332] transition-colors"
                    >
                      Anteprima
                    </Link>
                    <button className="text-xs text-[#888580] hover:text-[#1B4332] transition-colors">
                      Modifica
                    </button>
                    <button className="text-xs text-red-400 hover:text-red-600 transition-colors">
                      Elimina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
