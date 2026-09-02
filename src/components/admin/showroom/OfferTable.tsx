// Tabella admin offerte con sorting e paginazione (mostra anche campi Other)
import { useMemo, useState } from "react"
import type { Offer, Product } from "../../../types/showroom"
import { offerBadge } from "../../../services/showroomApi"
import { displayActivityCategory, displayFurnitureType } from "../../../types/showroom"

interface Props {
  offers: Offer[]
  products: Product[]
  onEdit: (o: Offer) => void
  onDelete: (o: Offer) => void
  onToggle: (id: string, next: boolean) => void
}

const itDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

type SK = "title" | "createdAt" | "discountValue"

export default function OfferTable({
  offers,
  products,
  onEdit,
  onDelete,
  onToggle,
}: Props) {
  const [sortKey, setSortKey] = useState<SK>("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const ps = 8

  const enriched = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const t = today.getTime()
    return offers.map((o) => {
      const s = new Date(o.startDate).getTime()
      const e = new Date(o.endDate + "T23:59:59").getTime()
      let phase: "active" | "upcoming" | "expired"
      if (t < s) phase = "upcoming"
      else if (t > e) phase = "expired"
      else phase = "active"
      return {
        o,
        phase,
        activityLabel: displayActivityCategory(o.activityCategory, o.activityCategoryOther),
        furnitureLabel: displayFurnitureType(o.furnitureType, o.furnitureTypeOther),
        prods: o.productIds
          .map((id) => products.find((p) => p.id === id))
          .filter(Boolean) as Product[],
      }
    })
  }, [offers, products])

  const sorted = useMemo(() => {
    const arr = [...enriched]
    arr.sort((a, b) => {
      const d = sortDir === "asc" ? 1 : -1
      switch (sortKey) {
        case "title":
          return a.o.title.localeCompare(b.o.title) * d
        case "discountValue":
          return (a.o.discountValue - b.o.discountValue) * d
        default:
          return (a.o.createdAt - b.o.createdAt) * d
      }
    })
    return arr
  }, [enriched, sortKey, sortDir])

  const tp = Math.max(1, Math.ceil(sorted.length / ps))
  const sp = Math.min(page, tp)
  const paged = sorted.slice((sp - 1) * ps, sp * ps)

  const hdr = (label: string, k: SK, align: "left" | "right" | "center" = "left") => (
    <th
      onClick={() => {
        if (k === sortKey) setSortDir((s) => (s === "asc" ? "desc" : "asc"))
        else {
          setSortKey(k)
          setSortDir("asc")
        }
        setPage(1)
      }}
      className={`px-4 py-3 text-[11px] uppercase tracking-wide text-[#888580] select-none cursor-pointer hover:text-[#1A1A18] ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : ""
      }`}
    >
      {label}{" "}
      <span className="opacity-60 text-[9px]">
        {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </th>
  )

  return (
    <div className="space-y-3">
      <div className="overflow-hidden border border-[#DDD9D0] bg-white">
        <table className="w-full text-sm hidden md:table">
          <thead>
            <tr className="border-b border-[#DDD9D0] bg-[#F7F5F0]">
              {hdr("Offerta", "title")}
              <th className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#888580] text-center">
                Categoria / Tipologia
              </th>
              {hdr("Sconto", "discountValue", "center")}
              <th className="px-4 py-3 text-[11px] uppercase tracking-wide text-[#888580] text-center">
                N. prodotti
              </th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-[#888580]">
                Periodo
              </th>
              <th className="px-4 py-3 text-center text-[11px] uppercase tracking-wide text-[#888580]">
                Stato
              </th>
              <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wide text-[#888580]">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="text-4xl text-[#DDD9D0] mb-3">🏷️</div>
                  <p className="text-[#4A4A46]">Nessuna offerta trovata</p>
                </td>
              </tr>
            ) : (
              paged.map(({ o, phase, prods, activityLabel, furnitureLabel }) => (
                <tr key={o.id} className="border-t border-[#EAE7E0] hover:bg-[#F7F5F0]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold px-2 py-1 text-white rounded"
                        style={{
                          background: o.discountType === "percent" ? "#B5965A" : "#1B4332",
                        }}
                      >
                        {offerBadge(o)}
                      </span>
                      <div>
                        <div className="font-medium">{o.title}</div>
                        <div className="text-xs text-[#888580] line-clamp-1 max-w-sm">
                          {o.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#4A4A46] text-center">
                    <div>{activityLabel}</div>
                    <div className="text-[#888580]">{furnitureLabel}</div>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    <div className="font-medium text-[#1A1A18]">
                      {o.discountType === "percent"
                        ? `${o.discountValue}%`
                        : `${o.discountValue}€`}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-[#888580]">
                      {o.discountType === "percent" ? "percentuale" : "fisso"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold">{o.productIds.length}</span>
                    {prods.length > 0 && (
                      <div className="text-[10px] text-[#888580] truncate max-w-[200px] mx-auto mt-1">
                        {prods.slice(0, 2).map((p) => p.name).join(", ")}
                        {prods.length > 2 ? ` +${prods.length - 2}` : ""}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#4A4A46]">
                    <div>Dal <span className="font-medium">{itDate(o.startDate)}</span></div>
                    <div className="mt-1">Al <span className="font-medium">{itDate(o.endDate)}</span></div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => onToggle(o.id, !o.active)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          o.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            o.active ? "bg-green-600" : "bg-gray-400"
                          }`}
                        />
                        {o.active ? "Attiva" : "Off"}
                      </button>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          phase === "active"
                            ? "bg-[#1B4332]/10 text-[#1B4332]"
                            : phase === "upcoming"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {phase === "active"
                          ? "In corso"
                          : phase === "upcoming"
                            ? "In partenza"
                            : "Scaduta"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-4 text-xs">
                      <button
                        onClick={() => onEdit(o)}
                        className="text-[#888580] hover:text-[#1B4332]"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => onDelete(o)}
                        className="text-red-600 hover:text-red-700"
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

        <div className="md:hidden divide-y divide-[#EAE7E0]">
          {paged.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#888580]">
              Nessuna offerta
            </div>
          ) : (
            paged.map(({ o, phase, activityLabel, furnitureLabel }) => (
              <div key={o.id} className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <span
                    className="text-xs font-bold px-2 py-1 text-white rounded flex-shrink-0"
                    style={{
                      background: o.discountType === "percent" ? "#B5965A" : "#1B4332",
                    }}
                  >
                    {offerBadge(o)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{o.title}</div>
                    <div className="text-xs text-[#888580]">
                      {activityLabel} · {furnitureLabel}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <div className="text-[#888580] uppercase">Sconto</div>
                    <div className="font-semibold text-[#1A1A18] mt-0.5">
                      {o.discountType === "percent"
                        ? `${o.discountValue}%`
                        : `${o.discountValue}€`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#888580] uppercase">Prodotti</div>
                    <div className="font-semibold text-[#1A1A18] mt-0.5">
                      {o.productIds.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#888580] uppercase">Stato</div>
                    <button
                      onClick={() => onToggle(o.id, !o.active)}
                      className={`mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        o.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {o.active ? "Attiva" : "Off"}
                    </button>
                    <div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded ${
                          phase === "active"
                            ? "bg-[#1B4332]/10 text-[#1B4332]"
                            : phase === "upcoming"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {phase === "active"
                          ? "In corso"
                          : phase === "upcoming"
                            ? "In partenza"
                            : "Scaduta"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-[#4A4A46]">
                  Dal <span className="font-medium">{itDate(o.startDate)}</span> al{" "}
                  <span className="font-medium">{itDate(o.endDate)}</span>
                </div>
                <div className="flex justify-end gap-4 text-xs pt-1">
                  <button onClick={() => onEdit(o)} className="text-[#1B4332] font-medium">
                    Modifica
                  </button>
                  <button onClick={() => onDelete(o)} className="text-red-600 font-medium">
                    Elimina
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {tp > 1 && (
        <div className="flex flex-wrap justify-between items-center gap-3 text-xs">
          <span className="text-[#888580]">
            Pagina {sp}/{tp} · {sorted.length} offerte
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={sp === 1}
              className="w-9 h-9 border border-[#DDD9D0] bg-white text-sm disabled:opacity-40"
            >
              ←
            </button>
            {Array.from({ length: tp }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - sp) <= 1 || p === 1 || p === tp)
              .map((p, idx, arr) => (
                <span key={p} className="inline-flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="w-4 text-center text-[#888580]">…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 border text-sm ${
                      p === sp
                        ? "bg-[#1B4332] border-[#1B4332] text-white"
                        : "bg-white border-[#DDD9D0] text-[#4A4A46] hover:bg-[#F7F5F0]"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(tp, p + 1))}
              disabled={sp === tp}
              className="w-9 h-9 border border-[#DDD9D0] bg-white text-sm disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
