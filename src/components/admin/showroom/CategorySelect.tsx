// Select: settore attività + campo "Altro" separato e obbligatorio se Altro
import { SECTORS, type ActivitySector } from "../../../constants/showroomSectors"

interface Props {
  value: ActivitySector
  otherValue: string
  onChange: (v: ActivitySector) => void
  onOtherChange: (v: string) => void
  error?: string
  id?: string
}

export default function CategorySelect({
  value,
  otherValue,
  onChange,
  onOtherChange,
  error,
  id,
}: Props) {
  const inCls = `w-full border ${
    error ? "border-red-400" : "border-[#DDD9D0] focus:border-[#1B4332]"
  } bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:outline-none`

  return (
    <div className="space-y-1.5">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as ActivitySector)}
        className={inCls}
      >
        {SECTORS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {value === "other" && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Specifica il settore…"
          className={inCls}
        />
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
