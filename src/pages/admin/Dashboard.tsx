import { Link } from "react-router-dom"

const kpis = [
  {
    label: "Preventivi ricevuti",
    value: "14",
    sub: "ultimi 30 giorni",
    color: "#1B4332",
    delta: "+3",
  },
  {
    label: "Progetti in lavorazione",
    value: "6",
    sub: "in corso",
    color: "#B5965A",
    delta: "0",
  },
  {
    label: "Progetti completati",
    value: "58",
    sub: "anno 2025",
    color: "#4A4A46",
    delta: "+12",
  },
  {
    label: "Lead da contattare",
    value: "4",
    sub: "in attesa risposta",
    color: "#C0392B",
    delta: "-1",
  },
]

const recentQuotes = [
  {
    id: 1,
    nome: "Luca Bernardi",
    azienda: "Barberia Moderna",
    settore: "Barbieri",
    data: "24/08/2025",
    stato: "nuovo",
  },
  {
    id: 2,
    nome: "Marta Vitali",
    azienda: "Studio V",
    settore: "Uffici",
    data: "23/08/2025",
    stato: "contattato",
  },
  {
    id: 3,
    nome: "Roberto Greco",
    azienda: "Boutique Greco",
    settore: "Negozi",
    data: "21/08/2025",
    stato: "contattato",
  },
  {
    id: 4,
    nome: "Istituto Pacinotti",
    azienda: "—",
    settore: "Scuole",
    data: "19/08/2025",
    stato: "chiuso",
  },
]

const recentProjects = [
  {
    id: "barber-milano",
    titolo: "The Craft Barbershop",
    settore: "Barbieri",
    stato: "completato",
    anno: 2024,
  },
  {
    id: "studio-legale-torino",
    titolo: "Studio Legale Marchetti",
    settore: "Uffici",
    stato: "completato",
    anno: 2024,
  },
  {
    id: "startup-hub-genova",
    titolo: "Innovation Hub Liguria",
    settore: "Uffici",
    stato: "in lavorazione",
    anno: 2025,
  },
]

const statusColor: Record<string, string> = {
  nuovo: "bg-blue-100 text-blue-700",
  contattato: "bg-amber-100 text-amber-700",
  chiuso: "bg-green-100 text-green-700",
  "in lavorazione": "bg-amber-100 text-amber-700",
  completato: "bg-green-100 text-green-700",
  bozza: "bg-gray-100 text-gray-600",
}

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light text-[#1A1A18]">
          Dashboard
        </h1>
        <p className="text-[#888580] text-sm mt-1">Mercoledì, 27 agosto 2025</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-[#DDD9D0] p-5">
            <div className="text-xs text-[#888580] uppercase tracking-widest mb-2">
              {k.label}
            </div>
            <div className="flex items-end justify-between">
              <span
                className="font-display text-4xl font-light"
                style={{ color: k.color }}
              >
                {k.value}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  k.delta.startsWith("+")
                    ? "bg-green-100 text-green-700"
                    : k.delta === "0"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-red-100 text-red-600"
                }`}
              >
                {k.delta}
              </span>
            </div>
            <div className="text-[#888580] text-xs mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-white border border-[#DDD9D0]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE7E0]">
            <h2 className="font-medium text-[#1A1A18] text-sm">
              Ultimi preventivi
            </h2>
            <Link
              to="/admin/preventivi"
              className="text-xs text-[#1B4332] hover:underline"
            >
              Vedi tutti →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F5F0] text-[#888580] text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-2.5">Nome</th>
                <th className="text-left px-5 py-2.5 hidden sm:table-cell">
                  Settore
                </th>
                <th className="text-left px-5 py-2.5">Data</th>
                <th className="text-left px-5 py-2.5">Stato</th>
              </tr>
            </thead>
            <tbody>
              {recentQuotes.map((q) => (
                <tr
                  key={q.id}
                  className="border-t border-[#EAE7E0] hover:bg-[#F7F5F0] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#1A1A18] text-sm">
                      {q.nome}
                    </div>
                    <div className="text-[#888580] text-xs">{q.azienda}</div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell text-[#4A4A46] text-xs">
                    {q.settore}
                  </td>
                  <td className="px-5 py-3 text-[#888580] text-xs">{q.data}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 font-medium rounded-full ${statusColor[q.stato]}`}
                    >
                      {q.stato}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Projects */}
        <div className="bg-white border border-[#DDD9D0]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE7E0]">
            <h2 className="font-medium text-[#1A1A18] text-sm">
              Ultimi progetti
            </h2>
            <Link
              to="/admin/progetti"
              className="text-xs text-[#1B4332] hover:underline"
            >
              Vedi tutti →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F5F0] text-[#888580] text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-2.5">Progetto</th>
                <th className="text-left px-5 py-2.5 hidden sm:table-cell">
                  Settore
                </th>
                <th className="text-left px-5 py-2.5">Stato</th>
                <th className="text-left px-5 py-2.5">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-[#EAE7E0] hover:bg-[#F7F5F0] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#1A1A18] text-sm">
                      {p.titolo}
                    </div>
                    <div className="text-[#888580] text-xs">{p.anno}</div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell text-[#4A4A46] text-xs">
                    {p.settore}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 font-medium rounded-full ${statusColor[p.stato]}`}
                    >
                      {p.stato}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      to={`/admin/progetti/${p.id}`}
                      className="text-xs text-[#1B4332] hover:underline"
                    >
                      Modifica
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ["+ Nuovo progetto", "/admin/progetti/nuovo"],
          ["Gestisci preventivi", "/admin/preventivi"],
          ["Libreria media", "/admin/media"],
          ["Impostazioni", "/admin/impostazioni"],
        ].map(([label, to]) => (
          <Link
            key={label as string}
            to={to as string}
            className="bg-white border border-[#DDD9D0] px-5 py-4 text-sm font-medium text-[#1A1A18] hover:border-[#1B4332] hover:text-[#1B4332] transition-colors text-center"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
