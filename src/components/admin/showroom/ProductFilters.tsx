// components/admin/showroom/ProductFilters.tsx
// Barra di ricerca + filtri avanzati per la lista Prodotti Showroom.
// Supporta: ricerca per nome/SKU, categoria, stato offerta/attivo.

import { type SHOWROOM_CATEGORIES } from "../../../services/showroomApi"

export type ProductFilterState = {
  q: string
  category: string
  offerStatus: "all" | "in_offer" | "no_offer" | "active" | "inactive"
}

export const defaultProductFilters: ProductFilterState = {
  q: "",
  category: "all",
  offerStatus: "all",
}

interface Props {
  filters: ProductFilterState
  onChange: (next: ProductFilterState) => void
  onReset: () => void
  categories: typeof SHOWROOM_CATEGORIES
  total: number
  matching: number
}

export default function ProductFilters({
  filters,
  onChange,
  onReset,
  categories,
  total,
  matching,
}: Props) {
  const set = (k: keyof ProductFilterState, v: string) =>
    onChange({ ...filters, [k]: v })

  return (
    <div className="bg-white border border-[#DDD9D0] p-4 lg:p-5 mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#1A1A18] font-medium">Filtri prodotti</span>
          <span className="text-[#888580] text-xs">
            {matching} / {total} prodotti
          </span>
        </div>
        {(filters.q || filters.category !== "all" || filters.offerStatus !== "all") && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[#888580] hover:text-[#1B4332] transition-colors"
          >
            ✕ Reset filtri
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-[11px] uppercase tracking-wide text-[#888580] mb-1.5">
            Ricerca per nome, descrizione o SKU
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888580] text-sm">
              🔎
            </span>
            <input
              type="text"
              value={filters.q}
              onChange={(e) => set("q", e.target.value)}
              placeholder="es. Divano chester, FAR-SOG-001…"
              className="w-full pl-9 pr-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wide text-[#888580] mb-1.5">
            Categoria
          </label>
          <select
            value={filters.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full px-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
          >
            <option value="all">Tutte le categorie</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wide text-[#888580] mb-1.5">
            Stato / Offerta
          </label>
          <select
            value={filters.offerStatus}
            onChange={(e) => set("offerStatus", e.target.value)}
            className="w-full px-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
          >
            <option value="all">Tutti</option>
            <option value="in_offer">Solo in offerta</option>
            <option value="no_offer">Solo senza offerta</option>
            <option value="active">Solo attivi</option>
            <option value="inactive">Solo disattivati</option>
          </select>
        </div>
      </div>
    </div>
  )
}
