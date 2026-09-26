import { useState } from "react"
import { QuoteNote } from "../../api/quotesApi"

interface InternalNotesListProps {
  notes: QuoteNote[]
  onAddNote: (text: string) => Promise<void>
  onDeleteNote: (noteIndex: number) => Promise<void>
  isAdding: boolean
}

export default function InternalNotesList({ notes, onAddNote, onDeleteNote, isAdding }: InternalNotesListProps) {
  const [newNote, setNewNote] = useState("")
  const [deletingNote, setDeletingNote] = useState<number | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      await onAddNote(newNote.trim())
      setNewNote("")
    } catch (error) {
      console.error("Error adding note:", error)
    }
  }

  const handleDeleteNote = async (noteIndex: number) => {
    if (window.confirm("Sei sicuro di voler eliminare questa nota interna?")) {
      setDeletingNote(noteIndex)
      try {
        await onDeleteNote(noteIndex)
      } catch (error) {
        console.error("Error deleting note:", error)
      } finally {
        setDeletingNote(null)
      }
    }
  }

  const sortedNotes = [...notes].map((note, originalIndex) => ({ ...note, originalIndex }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="bg-[var(--background)] p-4 rounded-lg">
      <dt className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide mb-3">
        Note interne
      </dt>

      {/* Notes list */}
      {sortedNotes.length > 0 ? (
        <div className="space-y-3 mb-4">
          {sortedNotes.map((note) => (
            <div
              key={`${note.originalIndex}-${note.timestamp}`}
              className="bg-white border border-[var(--border)] p-3 rounded-lg shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap break-words flex-1">
                  {note.text}
                </div>
                <button
                  onClick={() => handleDeleteNote(note.originalIndex)}
                  disabled={deletingNote === note.originalIndex}
                  className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
                  title="Elimina nota"
                >
                  {deletingNote === note.originalIndex ? "Eliminazione..." : "✕"}
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <span>{formatAuthor(note.author)}</span>
                <span>•</span>
                <span>{formatDate(note.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-[var(--muted-foreground)] italic mb-4">
          Nessuna nota interna
        </div>
      )}

      {/* Add note form */}
      <form onSubmit={handleSubmit}>
        <textarea
          rows={3}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Aggiungi una nota..."
          className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 rounded resize-none"
          disabled={isAdding}
        />
        <button
          type="submit"
          disabled={isAdding || !newNote.trim()}
          className="mt-2 bg-[var(--primary)] text-white text-xs font-medium px-4 py-2 hover:bg-[#143326] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? "Salvataggio..." : "Salva nota"}
        </button>
      </form>
    </div>
  )
}