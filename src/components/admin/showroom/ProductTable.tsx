// Tabella admin prodotti con sorting e paginazione (activitySector + campi Other)
import { useMemo, useState } from "react"
import {
  computeEffectivePrice,
  type Offer,
  type Product,
} from "../../../services/showroomApi"
import {
  displaySector,
  displayFurnitureType,
  type SortDirection,
} from "../../../types/showroom"

interface Props {
  products: Product[]
  offers: Offer[]
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
  onToggle: (id: string, next: boolean) => void
}

const eur = (n: number) =>
  n.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })

type SK = "name" | "basePrice" | "createdAt" | "activitySector" | "furnitureType"

export default function ProductTable({
  products,
  offers,
  onEdit,
  onDelete,
  onToggle,
}: Props) {
  const [sortKey, setSortKey] = useState<SK>("createdAt")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)
  const ps = 8

  const enriched = useMemo(
    () =>
      products.map((p) => ({
        p,
        eff: computeEffectivePrice(p, offers),
        sectorLabel: displaySector(p.activitySector, p.activitySectorOther),
        furnitureLabel: displayFurnitureType(p.furnitureType, p.furnitureTypeOther),
      })),
    [products, offers],
  )

  const sorted = useMemo(() => {
    const arr = [...enriched]
    arr.sort((a, b) => {
      const d = sortDir === "asc" ? 1 : -1
      switch (sortKey) {
        case "name":
          return a.p.name.localeCompare(b.p.name) * d
        case "basePrice":
          return (a.p.basePrice - b.p.basePrice) * d
        case "activitySector":
          return a.sectorLabel.localeCompare(b.sectorLabel) * d
        case "furnitureType":
          return a.furnitureLabel.localeCompare(b.furnitureLabel) * d
        default:
          return (a.p.createdAt - b.p.createdAt) * d
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
              {hdr("Prodotto", "name")}
              {hdr("Settore", "activitySector")}
              {hdr("Tipologia", "furnitureType")}
              {hdr("Prezzo", "basePrice", "right")}
              <th className="px-4 py-3 text-center text-[11px] uppercase tracking-wide text-[#888580]">
                Badge
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
                  <div className="text-4xl text-[#DDD9D0] mb-3">📦</div>
                  <p className="text-[#4A4A46]">Nessun prodotto trovato</p>
                </td>
              </tr>
            ) : (
              paged.map(({ p, eff, sectorLabel, furnitureLabel }) => (
                <tr
                  key={p.id}
                  className="border-t border-[#EAE7E0] hover:bg-[#F7F5F0]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden border bg-[#F7F5F0]">
                        {p.images[0] && (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-[#888580] truncate">
                          SKU <span className="font-mono">{p.sku}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block text-xs px-2 py-1 bg-[#EAE7E0] text-[#4A4A46]">
                      {sectorLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#4A4A46]">{furnitureLabel}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {eff.savings > 0 ? (
                      <div>
                        <div className="text-xs line-through text-[#888580]">
                          {eur(p.basePrice)}
                        </div>
                        <div className="font-semibold text-[#1B4332]">
                          {eur(eff.finalPrice)}
                        </div>
                      </div>
                    ) : (
                      <div className="font-medium">{eur(p.basePrice)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {eff.badge ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#B5965A]/15 text-[#8B6F3A] text-xs font-semibold">
                        {eff.badge}
                      </span>
                    ) : (
                      <span className="text-xs text-[#888580]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onToggle(p.id, !p.active)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          p.active ? "bg-green-600" : "bg-gray-400"
                        }`}
                      />
                      {p.active ? "Attivo" : "Inattivo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-4 text-xs">
                      <button
                        onClick={() => onEdit(p)}
                        className="text-[#888580] hover:text-[#1B4332]"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => onDelete(p)}
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
              Nessun prodotto
            </div>
          ) : (
            paged.map(({ p, eff, sectorLabel, furnitureLabel }) => (
              <div key={p.id} className="p-4 space-y-2">
                <div className="flex gap-3">
                  <div className="h-14 w-14 overflow-hidden border bg-[#F7F5F0]">
                    {p.images[0] && (
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{p.name}</div>
                    <div className="text-xs text-[#888580]">
                      {sectorLabel} · {furnitureLabel}
                    </div>
                    <div className="mt-1 text-sm">
                      {eff.savings > 0 ? (
                        <>
                          <span className="text-xs line-through text-[#888580] mr-2">
                            {eur(p.basePrice)}
                          </span>
                          <span className="font-semibold text-[#1B4332]">
                            {eur(eff.finalPrice)}
                          </span>
                          {eff.badge && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#B5965A]/15 text-[#8B6F3A] text-[10px] font-semibold">
                              {eff.badge}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="font-medium">{eur(p.basePrice)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <button
                    onClick={() => onToggle(p.id, !p.active)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                      p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        p.active ? "bg-green-600" : "bg-gray-400"
                      }`}
                    />
                    {p.active ? "Attivo" : "Inattivo"}
                  </button>
                  <div className="flex gap-4 text-xs">
                    <button onClick={() => onEdit(p)} className="text-[#1B4332] font-medium">
                      Modifica
                    </button>
                    <button onClick={() => onDelete(p)} className="text-red-600 font-medium">
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {tp > 1 && (
        <div className="flex flex-wrap justify-between items-center gap-3 text-xs">
          <span className="text-[#888580]">
            Pagina {sp}/{tp} · {sorted.length} prodotti
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
