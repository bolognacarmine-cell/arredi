import { type ReactNode } from "react"

type AlertType = "success" | "error" | "warning" | "info"

interface AlertProps {
  type: AlertType
  children: ReactNode
  className?: string
}

const alertStyles: Record<AlertType, string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
}

const alertIcons: Record<AlertType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
}

export default function Alert({ type, children, className = "" }: AlertProps) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border ${alertStyles[type]} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 text-lg font-bold">{alertIcons[type]}</span>
        <div className="flex-1 text-sm">{children}</div>
      </div>
    </div>
  )
}