const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

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
    const url = new URL(`${API_BASE_URL}/api/offers`)
    if (filters?.activitySector) url.searchParams.append("activitySector", filters.activitySector)
    if (filters?.active !== undefined) url.searchParams.append("active", filters.active.toString())

    const response = await fetch(url.toString())
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch offers")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching offers:", error)
    throw error
  }
}

export async function getOfferById(id: string): Promise<Offer> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/offers/${id}`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch offer")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching offer:", error)
    throw error
  }
}

export async function createOffer(data: Omit<Offer, "_id" | "createdAt" | "updatedAt">): Promise<Offer> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/offers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to create offer")
    }

    return result.data
  } catch (error) {
    console.error("Error creating offer:", error)
    throw error
  }
}

export async function updateOffer(id: string, data: Partial<Offer>): Promise<Offer> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/offers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to update offer")
    }

    return result.data
  } catch (error) {
    console.error("Error updating offer:", error)
    throw error
  }
}

export async function deleteOffer(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/offers/${id}`, {
      method: "DELETE",
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete offer")
    }
  } catch (error) {
    console.error("Error deleting offer:", error)
    throw error
  }
}
