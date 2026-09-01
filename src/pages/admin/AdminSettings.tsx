import { useState } from "react"

const users = [
  {
    id: 1,
    nome: "Marco Ferretti",
    email: "marco@artigianalegno.it",
    ruolo: "admin",
  },
  {
    id: 2,
    nome: "Giulia Ferretti",
    email: "giulia@artigianalegno.it",
    ruolo: "editor",
  },
  {
    id: 3,
    nome: "Sara Moretti",
    email: "sara@artigianalegno.it",
    ruolo: "editor",
  },
  {
    id: 4,
    nome: "Anna Conti",
    email: "anna@artigianalegno.it",
    ruolo: "viewer",
  },
]

const roleColor: Record<string, string> = {
  admin: "bg-[#1B4332] text-white",
  editor: "bg-amber-100 text-amber-700",
  viewer: "bg-gray-100 text-gray-600",
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"generale" | "utenti">("generale")
  const [saved, setSaved] = useState(false)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-light text-[#1A1A18]">
          Impostazioni
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#DDD9D0]">
        {(["generale", "utenti"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === t
                ? "border-[#1B4332] text-[#1B4332]"
                : "border-transparent text-[#888580] hover:text-[#1A1A18]"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "generale" && (
        <div className="max-w-2xl bg-white border border-[#DDD9D0] p-6 space-y-6">
          {[
            {
              label: "Nome azienda",
              defaultVal: "ArtigianaLegno Srl",
              type: "text",
            },
            { label: "P.IVA", defaultVal: "02345678901", type: "text" },
            {
              label: "Telefono sito",
              defaultVal: "+39 051 234 5678",
              type: "tel",
            },
            {
              label: "Email contatti",
              defaultVal: "info@artigianalegno.it",
              type: "email",
            },
            {
              label: "Città / indirizzo footer",
              defaultVal: "Via dell'Artigiano, 14 – Bologna",
              type: "text",
            },
          ].map(({ label, defaultVal, type }) => (
            <div key={label}>
              <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
                {label}
              </label>
              <input
                type={type}
                defaultValue={defaultVal}
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332]"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs text-[#888580] uppercase tracking-wide mb-1.5">
              Testo footer
            </label>
            <textarea
              rows={3}
              defaultValue="Arredi su misura per barbieri, uffici, negozi e scuole. Dall'idea al prodotto finito."
              className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
              }}
              className="bg-[#1B4332] text-white text-sm font-medium px-6 py-2.5 hover:bg-[#143326] transition-colors"
            >
              {saved ? "✓ Salvato" : "Salva impostazioni"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "utenti" && (
        <div className="max-w-3xl">
          <div className="bg-white border border-[#DDD9D0] overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F7F5F0] text-[#888580] text-xs uppercase tracking-wide border-b border-[#DDD9D0]">
                  <th className="text-left px-5 py-3">Utente</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left px-5 py-3">Ruolo</th>
                  <th className="text-left px-5 py-3">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-[#EAE7E0] hover:bg-[#F7F5F0]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1B4332] rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {u.nome
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <span className="font-medium text-[#1A1A18]">
                          {u.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-[#888580] text-xs">
                      {u.email}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2.5 py-1 font-medium rounded-full ${roleColor[u.ruolo]}`}
                      >
                        {u.ruolo}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button className="text-xs text-[#888580] hover:text-[#1B4332] mr-3 transition-colors">
                        Modifica
                      </button>
                      {u.ruolo !== "admin" && (
                        <button className="text-xs text-red-400 hover:text-red-600 transition-colors">
                          Rimuovi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="bg-[#1B4332] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#143326] transition-colors">
            + Invita utente
          </button>
        </div>
      )}
    </div>
  )
}
