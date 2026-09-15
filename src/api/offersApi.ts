// Get API base URL - use relative paths in same-origin, absolute when VITE_API_BASE_URL is set
const getApiUrl = (path: string) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (apiBaseUrl) {
    return `${apiBaseUrl.replace(/\/+$/, '')}${path}`
  }
  return path // Use relative path for same-origin
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002"

export interface Offer {
  _id: string
  id: string
  title: string
  description: string
  activitySector: string
  furnitureType: string
  furnitureTypeOther?: string
  discountType: "percent" | "fixed"
  discountValue: number
  productIds: string[]
  startDate: string
  endDate: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export async function getOffers(filters?: { activitySector?: string; active?: boolean }): Promise<Offer[]> {
  try {
    const baseUrl = getApiUrl('/api/offers')
    const url = new URL(baseUrl, window.location.origin)
    if (filters?.activitySector) url.searchParams.append("activitySector", filters.activitySector)
    if (filters?.active !== undefined) url.searchParams.append("active", filters.active.toString())

    const response = await fetch(url.toString(), {
      credentials: 'include',
    })
    const result = await response.json()

    if (Array.isArray(result)) return result
    if (result.success && Array.isArray(result.data)) return result.data
    if (result._id || result.id) return [result as Offer]
    if (!result.success) {
      throw new Error(result.error?.message || result.message || "Failed to fetch offers")
    }
    return []
  } catch (error) {
    console.error("Error fetching offers:", error)
    throw error
  }
}

export async function getOfferById(id: string): Promise<Offer> {
  try {
    const response = await fetch(getApiUrl(`/api/offers/${id}`), {
      credentials: 'include',
    })
    const result = await response.json()

    if (result._id || result.id) return result as Offer
    if (result.success && (result.data._id || result.data.id)) return result.data as Offer
    if (!result.success) {
      throw new Error(result.error?.message || result.message || "Failed to fetch offer")
    }
    throw new Error("Failed to fetch offer")
  } catch (error) {
    console.error("Error fetching offer:", error)
    throw error
  }
}

export async function createOffer(data: Omit<Offer, "_id" | "createdAt" | "updatedAt">): Promise<Offer> {
  try {
    const response = await fetch(getApiUrl('/api/offers'), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error?.message || result.message || "Failed to create offer")
    }

    if (result._id || result.id) return result as Offer
    if (result.success && (result.data._id || result.data.id)) return result.data as Offer
    throw new Error("Invalid offer payload from server")
  } catch (error) {
    console.error("Error creating offer:", error)
    throw error
  }
}

export async function updateOffer(id: string, data: Partial<Offer>): Promise<Offer> {
  try {
    const response = await fetch(getApiUrl(`/api/offers/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error?.message || result.message || "Failed to update offer")
    }

    if (result._id || result.id) return result as Offer
    if (result.success && (result.data._id || result.data.id)) return result.data as Offer
    throw new Error("Invalid offer payload from server")
  } catch (error) {
    console.error("Error updating offer:", error)
    throw error
  }
}

export async function deleteOffer(id: string): Promise<void> {
  try {
    const response = await fetch(getApiUrl(`/api/offers/${id}`), {
      method: "DELETE",
      credentials: 'include',
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok && result.error) {
      throw new Error(result.error?.message || result.message || "Failed to delete offer")
    }
  } catch (error) {
    console.error("Error deleting offer:", error)
    throw error
  }
}
