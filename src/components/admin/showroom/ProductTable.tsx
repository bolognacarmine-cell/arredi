// components/admin/showroom/ProductTable.tsx
// Tabella prodotti showroom: responsive, paginata, ordinabile per colonna.
// Mostra nome, categoria, prezzo base, sconto %, stato offerta (calcolato
// con `computeEffectivePrice`) e badge attivo/inattivo.

import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  computeEffectivePrice,
  type Offer,
  type Product,
  type SortDirection,
} from "../../../services/showroomApi"

type SortKey = "name" | "category" | "basePrice" | "createdAt" | "active"

interface Props {
  products: Product[]
  offers: Offer[]
  onEdit: (p: Product) => void
  onToggleActive: (id: string, next: boolean) => void
  onDelete: (p: Product) => void
  pageSize?: number
}

const eur = (n: number) =>
  n.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })

export default function ProductTable({
  products,
  offers,
  onEdit,
  onToggleActive,
  onDelete,
  pageSize = 8,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)

  const enriched = useMemo(() => {
    return products.map((p) => {
      const effective = computeEffectivePrice(p, offers)
      const discountPct =
        effective.savings > 0
          ? Math.round((effective.savings / p.basePrice) * 100)
          : 0
      return {
        product: p,
        effective,
        discountPct,
        inOffer: effective.appliedSource !== "base",
      }
    })
  }, [products, offers])

  const sorted = useMemo(() => {
    const arr = [...enriched]
    arr.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1
      switch (sortKey) {
        case "name":
          return a.product.name.localeCompare(b.product.name, "it-IT") * dir
        case "category":
          return a.product.category.localeCompare(b.product.category, "it-IT") * dir
        case "basePrice":
          return (a.product.basePrice - b.product.basePrice) * dir
        case "active":
          return Number(a.product.active) - Number(b.product.active) === 0
            ? a.product.name.localeCompare(b.product.name) * dir
            : (Number(a.product.active) - Number(b.product.active)) * dir
        case "createdAt":
        default:
          return (a.product.createdAt - b.product.createdAt) * dir
      }
    })
    return arr
  }, [enriched, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(k)
      setSortDir(k === "name" || k === "category" ? "asc" : "desc")
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
              {header("Prodotto", "name")}
              {header("Categoria", "category")}
              {header("Prezzo", "basePrice", "right")}
              {header("Sconto", "createdAt", "center")}
              {header("Stato", "active", "center")}
              <th className="px-5 py-3 text-right text-[11px] uppercase tracking-wide text-[#888580]">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="text-4xl text-[#DDD9D0] mb-3">📦</div>
                  <p className="text-[#4A4A46] mb-1">Nessun prodotto trovato</p>
                  <p className="text-xs text-[#888580]">
                    Prova a modificare i filtri oppure crea un nuovo prodotto.
                  </p>
                </td>
              </tr>
            ) : (
              paged.map(({ product, effective, discountPct, inOffer }) => (
                <tr
                  key={product.id}
                  className="border-t border-[#EAE7E0] hover:bg-[#F7F5F0] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden border border-[#EAE7E0] bg-[#F7F5F0]">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#888580]">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[#1A1A18] truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-[#888580] truncate">
                          SKU:{" "}
                          <span className="font-mono">{product.sku}</span>
                          {product.images.length > 1 && (
                            <span className="ml-3">
                              🖼️ {product.images.length} foto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-block bg-[#EAE7E0] text-[#4A4A46] text-xs px-2.5 py-1">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums">
                    {inOffer ? (
                      <div>
                        <div className="text-xs line-through text-[#888580]">
                          {eur(product.basePrice)}
                        </div>
                        <div className="font-semibold text-[#1B4332]">
                          {eur(effective.finalPrice)}
                        </div>
                      </div>
                    ) : (
                      <div className="font-medium text-[#1A1A18]">
                        {eur(product.basePrice)}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {inOffer ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#B5965A]/10 text-[#8B6F3A] text-xs font-semibold">
                        {effective.badgeText || `-${discountPct}%`}
                      </span>
                    ) : (
                      <span className="text-xs text-[#888580]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => onToggleActive(product.id, !product.active)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        product.active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={product.active ? "Clicca per disattivare" : "Clicca per attivare"}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          product.active ? "bg-green-600" : "bg-gray-400"
                        }`}
                      />
                      {product.active ? "Attivo" : "Inattivo"}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-4 text-xs">
                      <Link
                        to={`/progetti`}
                        target="_blank"
                        className="text-[#888580] hover:text-[#1B4332] transition-colors"
                      >
                        Anteprima
                      </Link>
                      <button
                        onClick={() => onEdit(product)}
                        className="text-[#888580] hover:text-[#1B4332] transition-colors"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => onDelete(product)}
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
              <div className="text-4xl text-[#DDD9D0] mb-3">📦</div>
              <p className="text-[#4A4A46] mb-1">Nessun prodotto trovato</p>
              <p className="text-xs text-[#888580]">
                Modifica i filtri oppure crea un nuovo prodotto.
              </p>
            </div>
          ) : (
            paged.map(({ product, effective, discountPct, inOffer }) => (
              <div key={product.id} className="p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden border border-[#EAE7E0] bg-[#F7F5F0]">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#1A1A18] text-sm">
                      {product.name}
                    </div>
                    <div className="text-xs text-[#888580] mt-0.5">
                      {product.category} ·{" "}
                      <span className="font-mono">{product.sku}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      {inOffer ? (
                        <>
                          <span className="text-xs line-through text-[#888580]">
                            {eur(product.basePrice)}
                          </span>
                          <span className="font-semibold text-[#1B4332]">
                            {eur(effective.finalPrice)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full bg-[#B5965A]/10 text-[#8B6F3A] text-[10px] font-semibold">
                            {effective.badgeText || `-${discountPct}%`}
                          </span>
                        </>
                      ) : (
                        <span className="font-medium text-[#1A1A18] text-sm">
                          {eur(product.basePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-3 pt-1">
                  <button
                    onClick={() => onToggleActive(product.id, !product.active)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                      product.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.active ? "bg-green-600" : "bg-gray-400"
                      }`}
                    />
                    {product.active ? "Attivo" : "Inattivo"}
                  </button>
                  <div className="flex gap-4 text-xs">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-[#1B4332] font-medium"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="text-red-600 font-medium"
                    >
                      Elimina
                    </button>
                  </div>
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
            prodotti totali
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
