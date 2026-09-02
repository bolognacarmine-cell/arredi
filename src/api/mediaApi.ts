const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export interface Media {
  _id: string
  cloudinaryUrl: string
  cloudinaryPublicId: string
  title?: string
  category: "hero" | "sector" | "project" | "gallery"
  width?: number
  height?: number
  format?: string
  bytes?: number
  createdAt: string
  updatedAt: string
}

export interface CreateMediaData {
  cloudinaryUrl: string
  cloudinaryPublicId: string
  title?: string
  category: "hero" | "sector" | "project" | "gallery"
  width?: number
  height?: number
  format?: string
  bytes?: number
}

export async function getMedia(category?: string): Promise<Media[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/media`)
    if (category) url.searchParams.append("category", category)

    const response = await fetch(url.toString())
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch media")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching media:", error)
    throw error
  }
}

export async function getMediaById(id: string): Promise<Media> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/media/${id}`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch media")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching media:", error)
    throw error
  }
}

export async function createMedia(data: CreateMediaData): Promise<Media> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to create media")
    }

    return result.data
  } catch (error) {
    console.error("Error creating media:", error)
    throw error
  }
}

export async function updateMedia(id: string, data: Partial<CreateMediaData>): Promise<Media> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/media/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to update media")
    }

    return result.data
  } catch (error) {
    console.error("Error updating media:", error)
    throw error
  }
}

export async function deleteMedia(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/media/${id}`, {
      method: "DELETE",
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete media")
    }
  } catch (error) {
    console.error("Error deleting media:", error)
    throw error
  }
}
