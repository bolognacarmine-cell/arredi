import { QuoteStatusHistory } from "../../api/quotesApi"

interface StatusHistoryTimelineProps {
  statusHistory: QuoteStatusHistory[]
}

export default function StatusHistoryTimeline({ statusHistory }: StatusHistoryTimelineProps) {
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  const formatAuthor = (author?: string): string => {
    if (!author || author === 'system') return 'Sistema'
    return author
  }

  const sortedHistory = [...statusHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="bg-[var(--background)] p-4 rounded-lg">
        <dt className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide mb-2">
          Storico stati
        </dt>
        <div className="text-sm text-[var(--muted-foreground)] italic">
          Nessun cambio stato registrato
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--background)] p-4 rounded-lg">
      <dt className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide mb-3">
        Storico stati
      </dt>
      <div className="space-y-3">
        {sortedHistory.map((entry, index) => (
          <div
            key={index}
            className="bg-white border border-[var(--border)] p-3 rounded-lg shadow-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--foreground)]">
                  {entry.previousStatus} → {entry.newStatus}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">
                  {formatDate(entry.timestamp)}
                </div>
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {formatAuthor(entry.changedBy)}
              </div>
            </div>
            {entry.note && (
              <div className="text-xs text-[var(--foreground)] bg-[var(--background)] p-2 rounded mt-2">
                {entry.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}