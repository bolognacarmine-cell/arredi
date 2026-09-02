// components/admin/showroom/OfferFilters.tsx
// Barra filtri per la lista Offerte: ricerca per titolo / descrizione, stato.

export type OfferFilterState = {
  q: string
  active: "all" | "active" | "inactive" | "upcoming" | "expired"
}

export const defaultOfferFilters: OfferFilterState = {
  q: "",
  active: "all",
}

interface Props {
  filters: OfferFilterState
  onChange: (next: OfferFilterState) => void
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

  return (
    <div className="bg-white border border-[#DDD9D0] p-4 lg:p-5 mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#1A1A18] font-medium">Filtri offerte</span>
          <span className="text-[#888580] text-xs">
            {matching} / {total} offerte
          </span>
        </div>
        {(filters.q || filters.active !== "all") && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[#888580] hover:text-[#1B4332] transition-colors"
          >
            ✕ Reset filtri
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[11px] uppercase tracking-wide text-[#888580] mb-1.5">
            Ricerca per titolo o descrizione
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888580] text-sm">
              🔎
            </span>
            <input
              type="text"
              value={filters.q}
              onChange={(e) => set("q", e.target.value)}
              placeholder="es. Black Friday, Showroom Demo…"
              className="w-full pl-9 pr-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-[#888580] mb-1.5">
            Stato e periodo
          </label>
          <select
            value={filters.active}
            onChange={(e) => set("active", e.target.value)}
            className="w-full px-3 py-2.5 border border-[#DDD9D0] bg-[#F7F5F0] text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
          >
            <option value="all">Tutte</option>
            <option value="active">Solo attive</option>
            <option value="inactive">Solo disattivate</option>
            <option value="upcoming">In partenza (future)</option>
            <option value="expired">Scadute</option>
          </select>
        </div>
      </div>
    </div>
  )
}
