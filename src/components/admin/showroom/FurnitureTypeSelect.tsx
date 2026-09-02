// Select: tipologia arredo (+ campo "Altro" libero)
import { FURNITURE_TYPES } from "../../constants/furnitureTypes"

interface Props {
  value: string
  onChange: (v: string) => void
  error?: string
}
export default function FurnitureTypeSelect({ value, onChange, error }: Props) {
  const list = [...FURNITURE_TYPES]
  const isAltro = list.every((c) => c !== value)
  return (
    <div className="space-y-1.5">
      <select
        value={isAltro ? "Altro" : value}
        onChange={(e) =>
          onChange(e.target.value === "Altro" ? (value === "Altro" ? "" : "Altro") : e.target.value)
        }
        className={`w-full border ${
          error ? "border-red-400" : "border-[#DDD9D0] focus:border-[#1B4332]"
        } bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:outline-none`}
      >
        {list.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {(value === "Altro" || isAltro) && (
        <input
          type="text"
          value={isAltro ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Specifica la tipologia…"
          className={`w-full border ${
            error ? "border-red-400" : "border-[#DDD9D0] focus:border-[#1B4332]"
          } bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:outline-none`}
        />
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
