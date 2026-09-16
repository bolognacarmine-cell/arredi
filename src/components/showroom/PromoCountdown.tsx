// Countdown discreto per la fine di una promozione prodotto
import { useEffect, useState } from "react"

interface Props {
  /** Data di fine promozione in formato yyyy-mm-dd (inclusa). */
  endDate: string
  className?: string
}

const remainingLabel = (endDate: string, at: number): string | null => {
  const end = new Date(endDate + "T23:59:59").getTime()
  const ms = end - at
  if (!Number.isFinite(end) || ms <= 0) return null
  const days = Math.floor(ms / 86_400_000)
  if (days >= 1) return `Ancora ${days} ${days === 1 ? "giorno" : "giorni"}`
  const hours = Math.floor(ms / 3_600_000)
  if (hours >= 1) return `Ancora ${hours} ${hours === 1 ? "ora" : "ore"}`
  const minutes = Math.max(1, Math.floor(ms / 60_000))
  return `Ancora ${minutes} min`
}

export default function PromoCountdown({ endDate, className = "" }: Props) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(t)
  }, [])

  const label = remainingLabel(endDate, now)
  if (!label) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[#B5965A] font-medium ${className}`}
    >
      <span aria-hidden="true">⏳</span>
      {label}
    </span>
  )
}
