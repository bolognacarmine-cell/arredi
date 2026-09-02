// Select: tipologia arredo (dipendente dal settore) + campo "Altro" obbligatorio
import {
  furnitureTypesFor,
  type ActivitySector,
} from "../../../constants/showroomSectors"

interface Props {
  sector: ActivitySector | "all"
  value: string
  otherValue: string
  onChange: (v: string) => void
  onOtherChange: (v: string) => void
  error?: string
}

export default function FurnitureTypeSelect({
  sector,
  value,
  otherValue,
  onChange,
  onOtherChange,
  error,
}: Props) {
  const types = furnitureTypesFor(sector)

  const inCls = `w-full border ${
    error ? "border-red-400" : "border-[#DDD9D0] focus:border-[#1B4332]"
  } bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:outline-none`

  return (
    <div className="space-y-1.5">
      <select
        value={types.includes(value) ? value : (types[0] ?? "Altro")}
        onChange={(e) => onChange(e.target.value)}
        className={inCls}
      >
        {types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      {value === "Altro" && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Specifica la tipologia arredo…"
          className={inCls}
        />
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
