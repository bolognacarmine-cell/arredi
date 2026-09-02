const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export interface QuoteItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Quote {
  _id: string
  id: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: QuoteItem[]
  totalAmount: number
  status: "pending" | "confirmed" | "cancelled"
  notes?: string
  createdAt: string
  updatedAt: string
}

export async function getQuotes(filters?: { status?: string }): Promise<Quote[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/quotes`)
    if (filters?.status) url.searchParams.append("status", filters.status)

    const response = await fetch(url.toString())
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch quotes")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching quotes:", error)
    throw error
  }
}

export async function getQuoteById(id: string): Promise<Quote> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quotes/${id}`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch quote")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching quote:", error)
    throw error
  }
}

export async function createQuote(data: Omit<Quote, "_id" | "createdAt" | "updatedAt">): Promise<Quote> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to create quote")
    }

    return result.data
  } catch (error) {
    console.error("Error creating quote:", error)
    throw error
  }
}

export async function updateQuote(id: string, data: Partial<Quote>): Promise<Quote> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quotes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to update quote")
    }

    return result.data
  } catch (error) {
    console.error("Error updating quote:", error)
    throw error
  }
}

export async function deleteQuote(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quotes/${id}`, {
      method: "DELETE",
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete quote")
    }
  } catch (error) {
    console.error("Error deleting quote:", error)
    throw error
  }
}
