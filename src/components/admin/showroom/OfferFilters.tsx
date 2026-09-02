// Filtri admin offerte showroom (settori + tipologie dipendenti)
import { SECTORS, furnitureTypesFor, type ActivitySector } from "../../../constants/showroomSectors"

export type OfferFilterState = {
  q: string
  sector: ActivitySector | "all"
  furniture: string
  status: "all" | "active" | "inactive" | "upcoming" | "expired"
}
export const defaultOF: OfferFilterState = {
  q: "",
  sector: "all",
  furniture: "all",
  status: "all",
}

interface Props {
  filters: OfferFilterState
  onChange: (f: OfferFilterState) => void
  onReset: () => void
  total: number
  matching: number
}

export default function OfferFilters({
  filters,
  onChange,
  onReset,
  total,
  matching,
}: Props) {
  const set = (k: keyof OfferFilterState, v: string) =>
    onChange({ ...filters, [k]: v })
  const availableTypes = furnitureTypesFor(filters.sector)
  return (
    <div className="bg-white border border-[#DDD9D0] p-4 mb-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm">
          <span className="font-medium text-[#1A1A18]">Filtri</span>{" "}
          <span className="text-xs text-[#888580]">{matching}/{total}</span>
        </div>
        {(filters.q || filters.sector !== "all" || filters.furniture !== "all" || filters.status !== "all") && (
          <button onClick={onReset} className="text-xs text-[#888580] hover:text-[#1B4332]">
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
            placeholder="Cerca per titolo…"
            className="w-full pl-9 pr-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm focus:border-[#1B4332] focus:outline-none"
          />
        </div>
        <select
          value={filters.sector}
          onChange={(e) => set("sector", e.target.value)}
          className="px-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm focus:border-[#1B4332] focus:outline-none"
        >
          <option value="all">Tutti i settori</option>
          {SECTORS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => set("status", e.target.value)}
          className="px-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm focus:border-[#1B4332] focus:outline-none"
        >
          <option value="all">Tutti stati</option>
          <option value="active">Attive</option>
          <option value="inactive">Inattive</option>
          <option value="upcoming">In partenza</option>
          <option value="expired">Scadute</option>
        </select>
      </div>
      <select
        value={filters.furniture}
        onChange={(e) => set("furniture", e.target.value)}
        className="w-full md:w-96 px-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm focus:border-[#1B4332] focus:outline-none"
      >
        <option value="all">Tutte le tipologie</option>
        {availableTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  )
}
