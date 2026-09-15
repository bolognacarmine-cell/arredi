import { useState } from "react"
import { useQuotes, type QuoteRecord } from "../../quoteStore"
import * as quotesApi from "../../api/quotesApi"
import { useAdminAuth } from "../../hooks/useAdminAuth"

const statusColor: Record<QuoteRecord["stato"], string> = {
  nuovo: "bg-blue-100 text-blue-700",
  contattato: "bg-amber-100 text-amber-700",
  chiuso: "bg-green-100 text-green-700",
}

const statuses: QuoteRecord["stato"][] = ["nuovo", "contattato", "chiuso"]

export default function AdminQuotes() {
  const { quotes, refreshQuotes } = useQuotes()
  const { checkAuth } = useAdminAuth()
  const [filter, setFilter] = useState<QuoteRecord["stato"] | "all">("all")
  const [selectedQuote, setSelectedQuote] = useState<QuoteRecord | null>(null)
  const [nota, setNota] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered =
    filter === "all" ? quotes : quotes.filter((q) => q.stato === filter)

  const handleStatusChange = async (quoteId: string, newStatus: QuoteRecord["stato"]) => {
    setIsUpdating(quoteId)
    setError(null)
    try {
      await quotesApi.updateQuoteStatus(quoteId, newStatus)
      await refreshQuotes()
      await checkAuth() // Re-verify auth after API call
    } catch (err) {
      console.error("Error updating quote status:", err)
      setError("Impossibile aggiornare lo stato. Riprova.")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeleteQuote = async (quoteId: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo preventivo?")) {
      setIsDeleting(quoteId)
      setError(null)
      try {
        await quotesApi.deleteQuote(quoteId)
        if (selectedQuote?.id === quoteId) {
          setSelectedQuote(null)
        }
        await refreshQuotes()
        await checkAuth() // Re-verify auth after API call
      } catch (err) {
        console.error("Error deleting quote:", err)
        setError("Impossibile eliminare il preventivo. Riprova.")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleExportCSV = () => {
    const headers = ["ID", "Nome", "Cognome", "Azienda", "Settore", "Email", "Telefono", "Data", "Stato", "Metratura", "Arredo", "Messaggio"]
    const rows = filtered.map((q) => [
      q.id,
      q.nome,
      q.cognome,
      q.azienda,
      q.settore,
      q.email,
      q.telefono,
      q.data,
      q.stato,
      q.metratura,
      q.arredo,
      q.messaggio,
    ])
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `preventivi_${new Date().toISOString().split("T")[0]}.csv`)
    link.click()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-[#1A1A18]">
            Preventivi & Lead
          </h1>
          <p className="text-[#888580] text-sm mt-0.5">
            {quotes.length} richieste totali
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="border border-[#DDD9D0] px-5 py-2.5 text-sm font-medium text-[#4A4A46] transition-colors hover:border-[#1B4332] hover:text-[#1B4332]"
        >
          Export CSV
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5">
        {([
          ["all", "Tutti"],
          ...statuses.map((s) => [s, s ? s.charAt(0).toUpperCase() + s.slice(1) : s]),
        ] as const).map(([k, l]) => (
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
        className={`grid gap-5 ${selectedQuote ? "lg:grid-cols-[1fr_360px]" : ""}`}
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
                  onClick={() => setSelectedQuote(q)}
                  className={`border-t border-[#EAE7E0] cursor-pointer transition-colors ${
                    selectedQuote?.id === q.id
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
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedQuote(q)
                        }}
                        className="text-xs text-[#1B4332] hover:underline"
                      >
                        Dettaglio
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteQuote(q.id)
                        }}
                        disabled={isDeleting === q.id}
                        className="text-xs text-red-600 hover:text-red-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting === q.id ? "Eliminazione..." : "Elimina"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selectedQuote && (
          <div className="bg-white border border-[#DDD9D0] p-6 h-fit">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-light text-[#1A1A18]">
                {selectedQuote.nome} {selectedQuote.cognome}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteQuote(selectedQuote.id)}
                  disabled={isDeleting === selectedQuote.id}
                  className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting === selectedQuote.id ? "Eliminazione..." : "Elimina"}
                </button>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-[#888580] text-xs hover:text-[#1A1A18]"
                >
                  ✕
                </button>
              </div>
            </div>

            <dl className="space-y-3 text-sm mb-5">
              {[
                ["Azienda", selectedQuote.azienda || "—"],
                ["Settore", selectedQuote.settore],
                ["Email", selectedQuote.email],
                ["Telefono", selectedQuote.telefono],
                ["Data richiesta", selectedQuote.data],
                [
                  "Metratura",
                  selectedQuote.metratura ? `${selectedQuote.metratura} m²` : "—",
                ],
                ["Arredi richiesti", selectedQuote.arredo || "—"],
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

            {selectedQuote.messaggio && (
              <div className="bg-[#F7F5F0] p-4 mb-5 text-sm text-[#4A4A46] leading-relaxed">
                "{selectedQuote.messaggio}"
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
                    onClick={() => handleStatusChange(selectedQuote.id, s)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      selectedQuote.stato === s
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
