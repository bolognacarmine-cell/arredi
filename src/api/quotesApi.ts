// Use relative paths for same-origin, absolute when VITE_API_BASE_URL is set for cross-origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

export interface QuoteAttachment {
  url: string
  secureUrl?: string
  publicId?: string
  originalName?: string
  mimeType?: string
  bytes?: number
  width?: number
  height?: number
}

export interface QuoteDocument {
  url: string
  secureUrl?: string
  publicId?: string
  originalName?: string
  mimeType?: string
  bytes?: number
}

export interface QuoteNote {
  text: string
  author?: string
  timestamp: string
}

export interface QuoteStatusHistory {
  previousStatus: string
  newStatus: string
  timestamp: string
  changedBy?: string
  note?: string
}

export interface Quote {
  _id: string
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
  createdAt: string
  updatedAt: string
}

const getApiUrl = (path: string) => {
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/+$/, '')}${path}`
  }
  return path // Use relative path for same-origin
}

export async function getQuotes(filters?: { status?: string }): Promise<Quote[]> {
  try {
    const url = new URL(getApiUrl('/api/quotes'), window.location.origin)
    if (filters?.status) url.searchParams.append("status", filters.status)

    const response = await fetch(url.toString(), {
      credentials: 'include',
    })
    const result = await response.json()

    if (result.success && Array.isArray(result.data)) {
      return result.data
    }

    // Fallback for legacy array responses
    if (Array.isArray(result)) {
      return result
    }

    throw new Error(result.message || "Failed to fetch quotes")
  } catch (error) {
    console.error("Error fetching quotes:", error)
    return []
  }
}

export async function getQuoteById(id: string): Promise<Quote> {
  try {
    const response = await fetch(getApiUrl(`/api/quotes/${id}`), {
      credentials: 'include',
    })
    const result = await response.json()

    if (result.success && result.data) {
      return result.data
    }

    // Fallback for legacy direct object responses
    if (result._id) {
      return result
    }

    throw new Error(result.message || "Failed to fetch quote")
  } catch (error) {
    console.error("Error fetching quote:", error)
    throw error
  }
}

export async function createQuote(data: Omit<Quote, "_id" | "createdAt" | "updatedAt">): Promise<Quote> {
  try {
    const response = await fetch(getApiUrl('/api/quotes'), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.success && result.data) {
      return result.data
    }

    // Fallback for legacy direct object responses
    if (result._id) {
      return result
    }

    throw new Error(result.message || "Failed to create quote")
  } catch (error) {
    console.error("Error creating quote:", error)
    throw error
  }
}

export async function createQuoteWithAttachments(formData: FormData): Promise<Quote> {
  try {
    const response = await fetch(getApiUrl('/api/quotes'), {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      credentials: 'include',
      body: formData,
    })

    const result = await response.json()

    if (result.success && result.data) {
      return result.data
    }

    // Fallback for legacy direct object responses
    if (result._id) {
      return result
    }

    throw new Error(result.message || "Failed to create quote with attachments")
  } catch (error) {
    console.error("Error creating quote with attachments:", error)
    throw error
  }
}

export async function updateQuote(id: string, data: Partial<Quote>): Promise<Quote> {
  try {
    const response = await fetch(getApiUrl(`/api/quotes/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.success && result.data) {
      return result.data
    }

    // Fallback for legacy direct object responses
    if (result._id) {
      return result
    }

    throw new Error(result.message || "Failed to update quote")
  } catch (error) {
    console.error("Error updating quote:", error)
    throw error
  }
}

export async function updateQuoteStatus(id: string, stato: "nuovo" | "contattato" | "chiuso"): Promise<Quote> {
  try {
    const response = await fetch(getApiUrl(`/api/quotes/${id}/status`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ stato }),
    })

    const result = await response.json()

    if (result.success && result.data) {
      return result.data
    }

    // Fallback for legacy direct object responses
    if (result._id) {
      return result
    }

    throw new Error(result.message || "Failed to update quote status")
  } catch (error) {
    console.error("Error updating quote status:", error)
    throw error
  }
}

export async function addQuoteNote(id: string, text: string): Promise<Quote> {
  try {
    const response = await fetch(getApiUrl(`/api/quotes/${id}/notes`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ text }),
    })

    const result = await response.json()

    if (result.success && result.data) {
      return result.data
    }

    // Fallback for legacy direct object responses
    if (result._id) {
      return result
    }

    throw new Error(result.message || "Failed to add quote note")
  } catch (error) {
    console.error("Error adding quote note:", error)
    throw error
  }
}

export async function deleteQuote(id: string): Promise<void> {
  try {
    const response = await fetch(getApiUrl(`/api/quotes/${id}`), {
      method: "DELETE",
      credentials: 'include',
    })

    const result = await response.json()

    if (result.message || response.ok) {
      return
    }

    if (result.success) {
      return
    }

    throw new Error(result.error?.message || result.message || "Failed to delete quote")
  } catch (error) {
    console.error("Error deleting quote:", error)
    throw error
  }
}
