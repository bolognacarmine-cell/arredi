// Filtri admin prodotti showroom
import { ACTIVITY_CATEGORIES } from "../../../constants/showroomCategories"
import { FURNITURE_TYPES } from "../../../constants/furnitureTypes"

export type ProductFilterState = {
  q: string
  activity: string
  furniture: string
  offerStatus: "all" | "in_offer" | "active" | "inactive"
}
export const defaultPF: ProductFilterState = {
  q: "",
  activity: "all",
  furniture: "all",
  offerStatus: "all",
}

interface Props {
  filters: ProductFilterState
  onChange: (f: ProductFilterState) => void
  onReset: () => void
  total: number
  matching: number
}

export default function ProductFilters({
  filters,
  onChange,
  onReset,
  total,
  matching,
}: Props) {
  const set = (k: keyof ProductFilterState, v: string) =>
    onChange({ ...filters, [k]: v })
  return (
    <div className="bg-white border border-[#DDD9D0] p-4 mb-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm">
          <span className="font-medium text-[#1A1A18]">Filtri</span>{" "}
          <span className="text-xs text-[#888580]">
            {matching}/{total}
          </span>
        </div>
        {(filters.q || filters.activity !== "all" || filters.furniture !== "all" || filters.offerStatus !== "all") && (
          <button
            onClick={onReset}
            className="text-xs text-[#888580] hover:text-[#1B4332]"
          >
            ✕ Reset
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#888580]">🔎</span>
          <input
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Ricerca nome, SKU…"
            className="w-full pl-9 pr-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm focus:border-[#1B4332] focus:outline-none"
          />
        </div>
        <select
          value={filters.activity}
          onChange={(e) => set("activity", e.target.value)}
          className="px-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm focus:border-[#1B4332] focus:outline-none"
        >
          <option value="all">Tutte categorie</option>
          {ACTIVITY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filters.offerStatus}
          onChange={(e) => set("offerStatus", e.target.value)}
          className="px-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm focus:border-[#1B4332] focus:outline-none"
        >
          <option value="all">Tutti stati</option>
          <option value="in_offer">In offerta</option>
          <option value="active">Attivi</option>
          <option value="inactive">Inattivi</option>
        </select>
      </div>
      <div>
        <select
          value={filters.furniture}
          onChange={(e) => set("furniture", e.target.value)}
          className="w-full md:w-80 px-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm focus:border-[#1B4332] focus:outline-none"
        >
          <option value="all">Tutte tipologie arredo</option>
          {FURNITURE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
