import { useEffect, useState } from "react"

export type QuoteRecord = {
  id: number
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
}

const QUOTES_STORAGE_KEY = "farcom-quotes"
const QUOTES_EVENT = "farcom-quotes-updated"

const defaultQuotes: QuoteRecord[] = [
  {
    id: 1,
    nome: "Luca",
    cognome: "Bernardi",
    azienda: "Barberia Moderna",
    settore: "Barbieri",
    email: "luca.b@email.it",
    telefono: "333 1234567",
    data: "24/08/2025",
    stato: "nuovo",
    metratura: "45",
    arredo: "Banco reception, 3 postazioni taglio, zona attesa",
    messaggio: "Sto aprendo un nuovo barbershop a Milano, in zona Navigli. Ho già un locale di circa 45mq. Ho bisogno di un'idea completa.",
  },
  {
    id: 2,
    nome: "Marta",
    cognome: "Vitali",
    azienda: "Studio V Architettura",
    settore: "Uffici",
    email: "m.vitali@studiov.it",
    telefono: "02 9876543",
    data: "23/08/2025",
    stato: "contattato",
    metratura: "120",
    arredo: "Reception, sala riunioni, 6 postazioni",
    messaggio: "Nuovo ufficio al quarto piano, edificio ristrutturato. Vogliamo uno stile minimal e funzionale.",
  },
  {
    id: 3,
    nome: "Roberto",
    cognome: "Greco",
    azienda: "Boutique Greco",
    settore: "Negozi",
    email: "r.greco@boutique.it",
    telefono: "055 7654321",
    data: "21/08/2025",
    stato: "contattato",
    metratura: "60",
    arredo: "Espositori, banco cassa, camerini",
    messaggio: "Abbigliamento donna luxury, Firenze centro storico. Budget non è il primo criterio.",
  },
  {
    id: 4,
    nome: "Istituto",
    cognome: "Pacinotti",
    azienda: "Istituto Tecnico Pacinotti",
    settore: "Scuole",
    email: "segreteria@pacinotti.edu.it",
    telefono: "051 456789",
    data: "19/08/2025",
    stato: "chiuso",
    metratura: "400",
    arredo: "20 aule, mensa, biblioteca",
    messaggio: "Ristrutturazione completa. Gara d'appalto vinta. Procedere con la progettazione.",
  },
  {
    id: 5,
    nome: "Federica",
    cognome: "Amato",
    azienda: "Amato Hair Studio",
    settore: "Barbieri",
    email: "f.amato@hair.it",
    telefono: "349 8765432",
    data: "17/08/2025",
    stato: "nuovo",
    metratura: "30",
    arredo: "3 postazioni, banco shampoo, reception",
    messaggio: "",
  },
]

export function readQuotes(): QuoteRecord[] {
  if (typeof window === "undefined") return defaultQuotes

  try {
    const storedValue = window.localStorage.getItem(QUOTES_STORAGE_KEY)
    if (!storedValue) return defaultQuotes

    const parsed = JSON.parse(storedValue) as QuoteRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultQuotes

    return parsed
  } catch {
    return defaultQuotes
  }
}

export function saveQuotes(quotes: QuoteRecord[]) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes))
  window.dispatchEvent(new CustomEvent(QUOTES_EVENT))
}

export function resetQuotes() {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(QUOTES_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(QUOTES_EVENT))
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>(() => readQuotes())

  useEffect(() => {
    const syncQuotes = () => setQuotes(readQuotes())

    window.addEventListener(QUOTES_EVENT, syncQuotes)
    window.addEventListener("storage", syncQuotes)

    return () => {
      window.removeEventListener(QUOTES_EVENT, syncQuotes)
      window.removeEventListener("storage", syncQuotes)
    }
  }, [])

  return quotes
}
