// components/admin/showroom/OfferTable.tsx
// Tabella offerte promozionali: responsive, paginata.
// Mostra titolo, numero prodotti coinvolti, tipo/valore sconto, periodo,
// badge promozionale, stato e azioni.

import { useMemo, useState } from "react"
import { type Offer, type Product, type SortDirection } from "../../../services/showroomApi"

type SortKey = "title" | "createdAt" | "discountValue" | "productIds"

interface Props {
  offers: Offer[]
  products: Product[]
  onEdit: (o: Offer) => void
  onToggleActive: (id: string, next: boolean) => void
  onDelete: (o: Offer) => void
  pageSize?: number
}

const itDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

export default function OfferTable({
  offers,
  products,
  onEdit,
  onToggleActive,
  onDelete,
  pageSize = 8,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)

  const enriched = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return offers.map((o) => {
      const start = new Date(o.startDate).getTime()
      const end = new Date(o.endDate + "T23:59:59").getTime()
      const now = today.getTime()
      let phase: "upcoming" | "active_window" | "expired"
      if (now < start) phase = "upcoming"
      else if (now > end) phase = "expired"
      else phase = "active_window"
      const associated = o.productIds
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean) as Product[]
      return { offer: o, phase, associated }
    })
  }, [offers, products])

  const sorted = useMemo(() => {
    const arr = [...enriched]
    arr.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1
      switch (sortKey) {
        case "title":
          return a.offer.title.localeCompare(b.offer.title, "it-IT") * dir
        case "discountValue":
          return (a.offer.discountValue - b.offer.discountValue) * dir
        case "productIds":
          return (a.offer.productIds.length - b.offer.productIds.length) * dir
        case "createdAt":
        default:
          return (a.offer.createdAt - b.offer.createdAt) * dir
      }
    })
    return arr
  }, [enriched, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(k)
      setSortDir(k === "title" ? "asc" : "desc")
    }
    setPage(1)
  }

  const header = (
    label: string,
    k: SortKey,
    align: "left" | "right" | "center" = "left",
  ) => (
    <th
      scope="col"
      onClick={() => toggleSort(k)}
      className={`px-5 py-3 text-[11px] uppercase tracking-wide text-[#888580] select-none cursor-pointer hover:text-[#1A1A18] transition-colors ${
        align === "right"
          ? "text-right"
          : align === "center"
            ? "text-center"
            : "text-left"
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-[9px] opacity-60">
          {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </span>
    </th>
  )

  return (
    <div className="space-y-4">
      <div className="overflow-hidden border border-[#DDD9D0] bg-white">
        {/* DESKTOP */}
        <table className="w-full text-sm hidden md:table">
          <thead>
            <tr className="border-b border-[#DDD9D0] bg-[#F7F5F0]">
              {header("Offerta", "title")}
              {header("Prodotti", "productIds", "center")}
              {header("Sconto", "discountValue", "center")}
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wide text-[#888580]">
                Periodo
              </th>
              <th className="px-5 py-3 text-center text-[11px] uppercase tracking-wide text-[#888580]">
                Stato
              </th>
              <th className="px-5 py-3 text-right text-[11px] uppercase tracking-wide text-[#888580]">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="text-4xl text-[#DDD9D0] mb-3">🏷️</div>
                  <p className="text-[#4A4A46] mb-1">Nessuna offerta trovata</p>
                  <p className="text-xs text-[#888580]">
                    Prova a modificare i filtri oppure crea una nuova offerta.
                  </p>
                </td>
              </tr>
            ) : (
              paged.map(({ offer, phase, associated }) => (
                <tr
                  key={offer.id}
                  className="border-t border-[#EAE7E0] hover:bg-[#F7F5F0] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold text-white flex-shrink-0"
                        style={{
                          background:
                            offer.discountType === "percent"
                              ? "#B5965A"
                              : "#1B4332",
                        }}
                      >
                        {offer.badgeText ||
                          (offer.discountType === "percent"
                            ? `-${offer.discountValue}%`
                            : `${offer.discountValue}€ OFF`)}
                      </span>
                      <div>
                        <div className="font-medium text-[#1A1A18]">
                          {offer.title}
                        </div>
                        <div className="text-xs text-[#888580] mt-0.5 line-clamp-1 max-w-md">
                          {offer.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-[#1A1A18] font-semibold">
                        {offer.productIds.length}
                      </span>
                      <span className="text-xs text-[#888580]">
                        {offer.productIds.length === 1
                          ? "prodotto"
                          : "prodotti"}
                      </span>
                    </span>
                    {associated.length > 0 && (
                      <div className="text-[10px] text-[#888580] mt-1 max-w-[220px] mx-auto truncate">
                        {associated.slice(0, 3).map((p) => p.name).join(", ")}
                        {associated.length > 3 && `, +${associated.length - 3}`}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center tabular-nums">
                    <div className="text-[#1A1A18] font-medium">
                      {offer.discountType === "percent"
                        ? `${offer.discountValue}%`
                        : `${offer.discountValue}€`}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-[#888580] mt-0.5">
                      {offer.discountType === "percent"
                        ? "percentuale"
                        : "importo fisso"}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-[#4A4A46]">
                    <div>
                      <span className="text-[#888580]">Dal</span>{" "}
                      <span className="font-medium">{itDate(offer.startDate)}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-[#888580]">Al</span>{" "}
                      <span className="font-medium">{itDate(offer.endDate)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => onToggleActive(offer.id, !offer.active)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          offer.active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            offer.active ? "bg-green-600" : "bg-gray-400"
                          }`}
                        />
                        {offer.active ? "Attiva" : "Disattivata"}
                      </button>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          phase === "active_window"
                            ? "bg-[#1B4332]/10 text-[#1B4332]"
                            : phase === "upcoming"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {phase === "active_window"
                          ? "In corso"
                          : phase === "upcoming"
                            ? "In partenza"
                            : "Scaduta"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-4 text-xs">
                      <button
                        onClick={() => onEdit(offer)}
                        className="text-[#888580] hover:text-[#1B4332] transition-colors"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => onDelete(offer)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* MOBILE */}
        <div className="md:hidden divide-y divide-[#EAE7E0]">
          {paged.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="text-4xl text-[#DDD9D0] mb-3">🏷️</div>
              <p className="text-[#4A4A46] mb-1">Nessuna offerta trovata</p>
              <p className="text-xs text-[#888580]">
                Modifica i filtri oppure crea una nuova offerta.
              </p>
            </div>
          ) : (
            paged.map(({ offer, phase }) => (
              <div key={offer.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold text-white flex-shrink-0"
                    style={{
                      background:
                        offer.discountType === "percent"
                          ? "#B5965A"
                          : "#1B4332",
                    }}
                  >
                    {offer.badgeText ||
                      (offer.discountType === "percent"
                        ? `-${offer.discountValue}%`
                        : `${offer.discountValue}€ OFF`)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#1A1A18] text-sm">
                      {offer.title}
                    </div>
                    <div className="text-xs text-[#888580] mt-0.5">
                      {offer.description.length > 120
                        ? offer.description.slice(0, 120) + "…"
                        : offer.description}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <div className="text-[#888580] uppercase tracking-wide">
                      Prodotti
                    </div>
                    <div className="font-semibold text-[#1A1A18] mt-0.5">
                      {offer.productIds.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#888580] uppercase tracking-wide">
                      Sconto
                    </div>
                    <div className="font-semibold text-[#1A1A18] mt-0.5">
                      {offer.discountType === "percent"
                        ? `${offer.discountValue}%`
                        : `${offer.discountValue}€`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#888580] uppercase tracking-wide">
                      Stato
                    </div>
                    <button
                      onClick={() => onToggleActive(offer.id, !offer.active)}
                      className={`mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        offer.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {offer.active ? "Attiva" : "Off"}
                    </button>
                    <div className="mt-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded ${
                          phase === "active_window"
                            ? "bg-[#1B4332]/10 text-[#1B4332]"
                            : phase === "upcoming"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {phase === "active_window"
                          ? "In corso"
                          : phase === "upcoming"
                            ? "In partenza"
                            : "Scaduta"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-[#4A4A46]">
                  <span className="text-[#888580]">Periodo:</span> dal{" "}
                  <span className="font-medium">{itDate(offer.startDate)}</span>{" "}
                  al <span className="font-medium">{itDate(offer.endDate)}</span>
                </div>
                <div className="flex justify-end gap-4 text-xs pt-1">
                  <button
                    onClick={() => onEdit(offer)}
                    className="text-[#1B4332] font-medium"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => onDelete(offer)}
                    className="text-red-600 font-medium"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Paginazione */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#888580]">
            Pagina <span className="text-[#1A1A18] font-medium">{safePage}</span>{" "}
            di {totalPages} ·{" "}
            <span className="text-[#1A1A18] font-medium">{sorted.length}</span>{" "}
            offerte totali
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-9 h-9 border border-[#DDD9D0] bg-white text-sm text-[#4A4A46] hover:bg-[#F7F5F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  Math.abs(p - safePage) <= 1 ||
                  p === 1 ||
                  p === totalPages,
              )
              .map((p, idx, arr) => (
                <span key={p} className="inline-flex items-center gap-1.5">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-xs text-[#888580] w-4 text-center">
                      …
                    </span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 border text-sm transition-colors ${
                      p === safePage
                        ? "bg-[#1B4332] border-[#1B4332] text-white"
                        : "bg-white border-[#DDD9D0] text-[#4A4A46] hover:bg-[#F7F5F0]"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-9 h-9 border border-[#DDD9D0] bg-white text-sm text-[#4A4A46] hover:bg-[#F7F5F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
