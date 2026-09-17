import { useEffect, useState } from "react"

type ToastType = "success" | "error" | "warning" | "info"

interface ToastProps {
  type: ToastType
  message: string
  duration?: number
  onClose: () => void
}

const toastStyles: Record<ToastType, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  warning: "bg-amber-600 text-white",
  info: "bg-blue-600 text-white",
}

const toastIcons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
}

export default function Toast({ type, message, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for exit animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 ${
        toastStyles[type]
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      role="alert"
    >
      <span className="text-lg font-bold">{toastIcons[type]}</span>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        className="ml-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
        aria-label="Chiudi notifica"
      >
        ✕
      </button>
    </div>
  )
}