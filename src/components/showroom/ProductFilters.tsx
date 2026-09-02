// Filtri pubblici lista showroom (settori + tipologie dipendenti)
import { SECTORS, furnitureTypesFor, type ActivitySector } from "../../constants/showroomSectors"

export type PublicFilterState = {
  q: string
  sector: ActivitySector | "all"
  furniture: string
  onlyOffers: boolean
}

export const defaultPublicFilters: PublicFilterState = {
  q: "",
  sector: "all",
  furniture: "all",
  onlyOffers: false,
}

interface Props {
  filters: PublicFilterState
  onChange: (f: PublicFilterState) => void
  matching: number
  total: number
}

export default function ProductFilters({ filters, onChange, matching, total }: Props) {
  const set = <K extends keyof PublicFilterState>(k: K, v: PublicFilterState[K]) =>
    onChange({ ...filters, [k]: v })

  const availableTypes = furnitureTypesFor(filters.sector)
  const hasAny =
    filters.q || filters.sector !== "all" || filters.furniture !== "all" || filters.onlyOffers

  return (
    <div className="bg-white border border-[#DDD9D0] p-5 mb-10 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-lg font-medium text-[#1A1A18]">Filtra prodotti</h2>
          <p className="text-xs text-[#888580] mt-0.5">
            {matching} di {total} prodotti
          </p>
        </div>
        {hasAny && (
          <button
            onClick={() => onChange(defaultPublicFilters)}
            className="text-xs text-[#888580] hover:text-[#1B4332] underline underline-offset-4"
          >
            ✕ Annulla filtri
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#888580]">🔎</span>
          <input
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Cerca per nome prodotto…"
            className="w-full pl-10 pr-3 py-3 border border-[#DDD9D0] bg-[#FAFAF7] text-sm focus:border-[#1B4332] focus:outline-none"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={filters.sector}
            onChange={(e) => {
              onChange({ ...filters, sector: e.target.value as ActivitySector | "all", furniture: "all" })
            }}
            className="w-full px-3 py-3 border border-[#DDD9D0] bg-[#FAFAF7] text-sm focus:border-[#1B4332] focus:outline-none appearance-none"
          >
            <option value="all">Tutti i settori</option>
            {SECTORS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={filters.furniture}
            onChange={(e) => set("furniture", e.target.value)}
            className="w-full px-3 py-3 border border-[#DDD9D0] bg-[#FAFAF7] text-sm focus:border-[#1B4332] focus:outline-none appearance-none"
          >
            <option value="all">Tutte le tipologie</option>
            {availableTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <label className="md:col-span-1 flex items-center justify-center gap-2 px-3 py-3 border border-[#DDD9D0] bg-[#FAFAF7] cursor-pointer hover:bg-white transition-colors">
          <input
            type="checkbox"
            checked={filters.onlyOffers}
            onChange={(e) => set("onlyOffers", e.target.checked)}
            className="w-4 h-4 accent-[#B5965A]"
          />
          <span className="text-xs sm:text-sm font-medium text-[#4A4A46]">
            Solo in offerta
          </span>
        </label>
      </div>
    </div>
  )
}
