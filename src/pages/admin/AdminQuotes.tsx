import { useState, useEffect, useRef } from "react"
import { useQuotes, type QuoteRecord, type QuoteAttachment } from "../../quoteStore"
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
  const [loading, setLoading] = useState(true)
  const [expandedMessage, setExpandedMessage] = useState(false)
  const [modalImage, setModalImage] = useState<string | null>(null)
  const detailPanelRef = useRef<HTMLDivElement>(null)

  const filtered =
    filter === "all" ? quotes : (Array.isArray(quotes) ? quotes.filter((q) => q.stato === filter) : [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalImage) {
          setModalImage(null)
        } else if (selectedQuote) {
          setSelectedQuote(null)
          setExpandedMessage(false)
        }
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [selectedQuote, modalImage])

  // Focus management when panel opens
  useEffect(() => {
    if (selectedQuote && detailPanelRef.current) {
      detailPanelRef.current.focus()
    }
  }, [selectedQuote])

  const handleStatusChange = async (quoteId: string, newStatus: QuoteRecord["stato"]) => {
    setIsUpdating(quoteId)
    setError(null)
    try {
      await quotesApi.updateQuoteStatus(quoteId, newStatus)
      await refreshQuotes()
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

  const handlePrint = () => {
    if (selectedQuote) {
      window.print()
    }
  }

  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "—"
    }
    if (typeof value === "boolean") {
      return value ? "Sì" : "No"
    }
    if (Array.isArray(value)) {
      return value.join(", ")
    }
    if (typeof value === "object") {
      return JSON.stringify(value)
    }
    return String(value)
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "—"
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const isMessageLong = (message: string) => {
    return message.length > 200
  }

  // Loading state
  useEffect(() => {
    const loadQuotes = async () => {
      setLoading(true)
      try {
        await refreshQuotes()
      } catch (err) {
        console.error("Error loading quotes:", err)
        setError("Impossibile caricare i preventivi. Riprova.")
      } finally {
        setLoading(false)
      }
    }

    loadQuotes()
  }, [])

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-light text-[#1A1A18]">
              Preventivi & Lead
            </h1>
            <p className="text-[#888580] text-sm mt-0.5">
              {loading ? "Caricamento..." : `${quotes.length} richieste totali`}
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="border border-[#DDD9D0] bg-white px-5 py-2.5 text-sm font-medium text-[#4A4A46] transition-colors hover:border-[#1B4332] hover:text-[#1B4332] shadow-sm"
          >
            Export CSV
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
            {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {([
            ["all", "Tutti"],
            ...statuses.map((s) => [s, s ? s.charAt(0).toUpperCase() + s.slice(1) : s]),
          ] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                filter === k
                  ? "bg-[#1B4332] text-white shadow-sm"
                  : "bg-white border border-[#DDD9D0] text-[#4A4A46] hover:border-[#1B4332]"
              }`}
              aria-pressed={filter === k}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-white border border-[#DDD9D0] rounded-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4332]"></div>
            <p className="mt-4 text-[#888580] text-sm">Caricamento preventivi...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white border border-[#DDD9D0] rounded-lg p-8 text-center">
            <p className="text-[#888580] text-sm">
              {filter === "all" ? "Nessun preventivo presente" : `Nessun preventivo con stato "${filter}"`}
            </p>
          </div>
        )}

        {/* Content grid */}
        {!loading && filtered.length > 0 && (
          <div
            className={`grid gap-6 ${selectedQuote ? "lg:grid-cols-[1fr_400px]" : ""}`}
          >
            {/* Table */}
            <div className="bg-white border border-[#DDD9D0] rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F7F5F0] text-[#888580] text-xs uppercase tracking-wide border-b border-[#DDD9D0]">
                      <th className="text-left px-5 py-3 font-medium">Contatto</th>
                      <th className="text-left px-5 py-3 hidden sm:table-cell font-medium">
                        Settore
                      </th>
                      <th className="text-left px-5 py-3 hidden md:table-cell font-medium">
                        Data
                      </th>
                      <th className="text-left px-5 py-3 font-medium">Stato</th>
                      <th className="text-left px-5 py-3 font-medium">Azioni</th>
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
                        tabIndex={0}
                        role="button"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            setSelectedQuote(q)
                          }
                        }}
                      >
                        <td className="px-5 py-3">
                          <div className="font-medium text-[#1A1A18]">
                            {q.nome} {q.cognome}
                          </div>
                          <div className="text-[#888580] text-xs">{q.azienda || "—"}</div>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell text-[#4A4A46] text-xs">
                          {q.settore || "—"}
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
                              className="text-xs text-[#1B4332] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-1 rounded"
                            >
                              Dettaglio
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteQuote(q.id)
                              }}
                              disabled={isDeleting === q.id}
                              className="text-xs text-red-600 hover:text-red-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
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
            </div>

            {/* Detail panel */}
            {selectedQuote && (
              <div
                ref={detailPanelRef}
                className="bg-white border border-[#DDD9D0] rounded-lg shadow-sm p-6 h-fit lg:sticky lg:top-8"
                tabIndex={-1}
                role="dialog"
                aria-labelledby="quote-detail-title"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    id="quote-detail-title"
                    className="font-display text-xl font-light text-[#1A1A18]"
                  >
                    {selectedQuote.nome} {selectedQuote.cognome}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrint}
                      className="text-[#888580] text-xs hover:text-[#1B4332] font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-1 rounded px-2 py-1"
                      title="Stampa preventivo"
                    >
                      🖨️
                    </button>
                    <button
                      onClick={() => handleDeleteQuote(selectedQuote.id)}
                      disabled={isDeleting === selectedQuote.id}
                      className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded px-2 py-1"
                    >
                      {isDeleting === selectedQuote.id ? "Eliminazione..." : "Elimina"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuote(null)
                        setExpandedMessage(false)
                      }}
                      className="text-[#888580] text-xs hover:text-[#1A1A18] font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-1 rounded px-2 py-1"
                      aria-label="Chiudi dettagli"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Two-column layout for details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    {[
                      ["Azienda", selectedQuote.azienda],
                      ["Settore", selectedQuote.settore],
                      ["Email", selectedQuote.email],
                      ["Telefono", selectedQuote.telefono],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="border-b border-[#EAE7E0] pb-2 last:border-0"
                      >
                        <dt className="text-[#888580] text-xs uppercase tracking-wide mb-0.5">
                          {label}
                        </dt>
                        <dd className="text-[#1A1A18] font-medium text-sm whitespace-pre-wrap break-words" style={{ overflowWrap: "anywhere" }}>
                          {formatFieldValue(value)}
                        </dd>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[
                      ["Data richiesta", selectedQuote.data],
                      [
                        "Metratura",
                        selectedQuote.metratura ? `${selectedQuote.metratura} m²` : null,
                      ],
                      ["Arredi richiesti", selectedQuote.arredo],
                      ["Stato", selectedQuote.stato],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="border-b border-[#EAE7E0] pb-2 last:border-0"
                      >
                        <dt className="text-[#888580] text-xs uppercase tracking-wide mb-0.5">
                          {label}
                        </dt>
                        <dd className="text-[#1A1A18] font-medium text-sm whitespace-pre-wrap break-words" style={{ overflowWrap: "anywhere" }}>
                          {formatFieldValue(value)}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message section with expand/collapse */}
                {selectedQuote.messaggio && (
                  <div className="bg-[#F7F5F0] p-4 mb-6 rounded-lg">
                    <dt className="text-[#888580] text-xs uppercase tracking-wide mb-2">
                      Messaggio
                    </dt>
                    <div className="relative">
                      <dd
                        className={`text-sm text-[#4A4A46] leading-relaxed whitespace-pre-wrap break-words ${
                          !expandedMessage && isMessageLong(selectedQuote.messaggio) ? "max-h-24 overflow-hidden" : ""
                        }`}
                        style={{ overflowWrap: "anywhere" }}
                      >
                        {selectedQuote.messaggio}
                      </dd>
                      {!expandedMessage && isMessageLong(selectedQuote.messaggio) && (
                        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" style={{ background: "linear-gradient(to top, #F7F5F0, transparent)" }} />
                      )}
                    </div>
                    {isMessageLong(selectedQuote.messaggio) && (
                      <button
                        onClick={() => setExpandedMessage(!expandedMessage)}
                        className="mt-2 text-xs text-[#1B4332] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-1 rounded"
                      >
                        {expandedMessage ? "Mostra meno" : "Mostra tutto"}
                      </button>
                    )}
                  </div>
                )}

                {/* Internal notes */}
                {selectedQuote.note && (
                  <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-100">
                    <dt className="text-[#888580] text-xs uppercase tracking-wide mb-2">
                      Note interne
                    </dt>
                    <dd className="text-sm text-[#4A4A46] leading-relaxed whitespace-pre-wrap break-words" style={{ overflowWrap: "anywhere" }}>
                      {selectedQuote.note}
                    </dd>
                  </div>
                )}

                {/* Attachments */}
                {selectedQuote.attachments && selectedQuote.attachments.length > 0 && (
                  <div className="mb-6">
                    <dt className="text-[#888580] text-xs uppercase tracking-wide mb-3">
                      Allegati del cliente
                    </dt>
                    <div className="quote-attachments-grid">
                      {selectedQuote.attachments.map((attachment: QuoteAttachment, index: number) => {
                        console.log('[AdminQuotes] Rendering attachment:', index, attachment)
                        return (
                          <div key={index} className="relative group">
                            <div className="quote-attachment-preview cursor-pointer" onClick={() => setModalImage(attachment.secureUrl || attachment.url)}>
                              <img
                                src={attachment.secureUrl || attachment.url}
                                alt={attachment.originalName || `Allegato ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('[AdminQuotes] Image load error:', attachment.secureUrl || attachment.url)
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                            <div className="mt-2">
                              <div className="text-xs text-[#1A1A18] font-medium truncate" title={attachment.originalName || `Allegato ${index + 1}`}>
                                {attachment.originalName || `Allegato ${index + 1}`}
                              </div>
                              <div className="text-xs text-[#888580]">
                                {formatFileSize(attachment.bytes)}
                              </div>
                            </div>
                            <a
                              href={attachment.secureUrl || attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Apri in nuova scheda"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* No attachments message */}
                {(!selectedQuote.attachments || selectedQuote.attachments.length === 0) && (
                  <div className="mb-6">
                    <dt className="text-[#888580] text-xs uppercase tracking-wide mb-3">
                      Allegati del cliente
                    </dt>
                    <div className="text-sm text-[#888580] italic">
                      Nessun allegato
                    </div>
                  </div>
                )}

                {/* Status change */}
                <div className="mb-6">
                  <label className="block text-xs text-[#888580] uppercase tracking-wide mb-2">
                    Cambia stato
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selectedQuote.id, s)}
                        disabled={isUpdating === selectedQuote.id}
                        className={`px-3 py-1.5 text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-1 rounded ${
                          selectedQuote.stato === s
                            ? "border-[#1B4332] bg-[#1B4332] text-white"
                            : "border-[#DDD9D0] text-[#4A4A46] hover:border-[#1B4332]"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isUpdating === selectedQuote.id ? "Aggiornamento..." : s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add note */}
                <div>
                  <label htmlFor="internal-note" className="block text-xs text-[#888580] uppercase tracking-wide mb-2">
                    Aggiungi nota interna
                  </label>
                  <textarea
                    id="internal-note"
                    rows={3}
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Aggiungi una nota..."
                    className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-1 rounded resize-none"
                  />
                  <button
                    onClick={() => {
                      // Here you would implement the note saving logic
                      console.log("Saving note:", nota)
                      setNota("")
                    }}
                    className="mt-2 bg-[#1B4332] text-white text-xs font-medium px-4 py-2 hover:bg-[#143326] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-1 rounded"
                  >
                    Salva nota
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image modal */}
        {modalImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setModalImage(null)}
            role="dialog"
            aria-modal="true"
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={modalImage}
                alt="Anteprima immagine"
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setModalImage(null)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Chiudi anteprima"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }

        .quote-attachments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          min-width: 0;
          width: 100%;
        }

        .quote-attachment-preview {
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          border-radius: 14px;
          border: 1px solid #DDD9D0;
        }

        .quote-attachment-preview img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  )
}
