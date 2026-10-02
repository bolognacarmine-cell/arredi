import { useEffect, useState } from "react"
import * as quotesApi from "./api/quotesApi"

export type QuoteAttachment = {
  url: string
  secureUrl?: string
  publicId?: string
  originalName?: string
  mimeType?: string
  bytes?: number
  width?: number
  height?: number
}

export type QuoteDocument = {
  url: string
  secureUrl?: string
  publicId?: string
  originalName?: string
  mimeType?: string
  bytes?: number
}

export type QuoteNote = {
  text: string
  author?: string
  timestamp: string
}

export type QuoteStatusHistory = {
  previousStatus: string
  newStatus: string
  timestamp: string
  changedBy?: string
  note?: string
}

export type QuoteRecord = {
  id: string
  nome: string
  cognome: string
  azienda: string
  settore: string
  email: string
  telefono: string
  data: string
  stato: "nuovo" | "contattato" | "chiuso"
  metratura: string
  arredo: string
  messaggio: string
  note?: string
  notes?: QuoteNote[]
  statusHistory?: QuoteStatusHistory[]
  attachments?: QuoteAttachment[]
  documents?: QuoteDocument[]
}

const QUOTES_STORAGE_KEY = "farcom-quotes"
const QUOTES_EVENT = "farcom-quotes-updated"

const defaultQuotes: QuoteRecord[] = []

// React 19 Error #300 guard: batching + queueMicrotask dei dispatchEvent
// per evitare che listener setState in consumer DIVERSO venga invocato
// durante la fase di render di un altro componente (cross-component setState).
let _pendingQuotesDispatch = false
function _batchedQuotesDispatch() {
  if (_pendingQuotesDispatch) return
  _pendingQuotesDispatch = true
  queueMicrotask(() => {
    _pendingQuotesDispatch = false
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(QUOTES_EVENT))
      }
    } catch {
      /* cross-context dispatch may throw, ignore */
    }
  })
}

export function readQuotes(): QuoteRecord[] {
  if (typeof window === "undefined") return []

  try {
    const storedValue = window.localStorage.getItem(QUOTES_STORAGE_KEY)
    if (!storedValue) return []

    const parsed = JSON.parse(storedValue) as QuoteRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) return []

    return parsed
  } catch {
    return []
  }
}

export function saveQuotes(quotes: QuoteRecord[]) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes))
  _batchedQuotesDispatch()
}

export function resetQuotes() {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(QUOTES_STORAGE_KEY)
  _batchedQuotesDispatch()
}

export async function deleteQuote(quoteId: string): Promise<void> {
  try {
    await quotesApi.deleteQuote(quoteId)
  } catch (error) {
    console.error("Error deleting quote from API:", error)
    throw error
  }
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>(() => readQuotes())

  useEffect(() => {
    // queueMicrotask previene #300: il dispatch globale arriva in un microtask
    // successivo a qualsiasi render, non DURANTE il workloop di React corrente.
    const syncQuotes = () => queueMicrotask(() => setQuotes(readQuotes()))

    window.addEventListener(QUOTES_EVENT, syncQuotes)
    window.addEventListener("storage", syncQuotes)

    return () => {
      window.removeEventListener(QUOTES_EVENT, syncQuotes)
      window.removeEventListener("storage", syncQuotes)
    }
  }, [])

  // Load quotes from API on mount
  useEffect(() => {
    async function loadQuotesFromApi() {
      try {
        const apiQuotes = await quotesApi.getQuotes()
        console.log('[QuoteStore] Loaded quotes from API:', apiQuotes.length)
        // Convert API quotes to local format
        const convertedQuotes: QuoteRecord[] = apiQuotes.map((q) => {
          console.log('[QuoteStore] Processing quote:', q._id || q.id, 'attachments:', q.attachments?.length || 0, 'documents:', q.documents?.length || 0)
          return {
            id: q._id || q.id,
            nome: q.nome,
            cognome: q.cognome,
            azienda: q.azienda,
            settore: q.settore,
            email: q.email,
            telefono: q.telefono,
            data: q.data,
            stato: q.stato,
            metratura: q.metratura,
            arredo: q.arredo,
            messaggio: q.messaggio,
            note: q.note,
            notes: q.notes,
            statusHistory: q.statusHistory,
            attachments: q.attachments,
            documents: q.documents,
          }
        })
        setQuotes(convertedQuotes.length > 0 ? convertedQuotes : [])
      } catch (err) {
        console.error("Error loading quotes from API:", err)
        // Fallback to empty array if API fails - don't show mock data
        setQuotes([])
      }
    }

    loadQuotesFromApi()
  }, [])

  const refreshQuotes = async () => {
    try {
      const apiQuotes = await quotesApi.getQuotes()
      console.log('[QuoteStore] Refreshed quotes from API:', apiQuotes.length)
      const convertedQuotes: QuoteRecord[] = apiQuotes.map((q) => {
        console.log('[QuoteStore] Refreshing quote:', q._id || q.id, 'attachments:', q.attachments?.length || 0, 'documents:', q.documents?.length || 0)
        return {
          id: q._id || q.id,
          nome: q.nome,
          cognome: q.cognome,
          azienda: q.azienda,
          settore: q.settore,
          email: q.email,
          telefono: q.telefono,
          data: q.data,
          stato: q.stato,
          metratura: q.metratura,
          arredo: q.arredo,
          messaggio: q.messaggio,
          note: q.note,
          notes: q.notes,
          statusHistory: q.statusHistory,
          attachments: q.attachments,
          documents: q.documents,
        }
      })
      setQuotes(convertedQuotes.length > 0 ? convertedQuotes : [])
    } catch (err) {
      console.error("Error refreshing quotes from API:", err)
    }
  }

  return { quotes, refreshQuotes, setQuotes }
}
