// Su Render il backend non è disponibile, disabilitiamo le chiamate API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""
const isApiAvailable = !!API_BASE_URL

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
  // Se l'API non è disponibile (es. su Render), ritorna array vuoto
  if (!isApiAvailable) {
    return []
  }

  try {
    const url = new URL(`${API_BASE_URL}/api/media`)
    if (category) url.searchParams.append("category", category)

    const response = await fetch(url.toString())
    const result = await response.json()

    // Il backend ritorna direttamente l'array, non { success, data }
    if (Array.isArray(result)) {
      return result
    }

    // Fallback per formato con { success, data }
    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || "Failed to fetch media")
  } catch (error) {
    console.error("Error fetching media:", error)
    // Ritorna array vuoto invece di bloccare
    return []
  }
}

export async function getMediaById(id: string): Promise<Media> {
  if (!isApiAvailable) {
    throw new Error("API not available")
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/media/${id}`)
    const result = await response.json()

    // Il backend ritorna direttamente l'oggetto media, non { success, data }
    if (result._id) {
      return result
    }

    // Fallback per formato con { success, data }
    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || "Failed to fetch media")
  } catch (error) {
    console.error("Error fetching media:", error)
    throw error
  }
}

export async function createMedia(data: CreateMediaData): Promise<Media> {
  if (!isApiAvailable) {
    // Su Render, ritorna un oggetto mock per non bloccare
    return {
      _id: "mock-" + Date.now(),
      cloudinaryUrl: data.cloudinaryUrl,
      cloudinaryPublicId: data.cloudinaryPublicId,
      title: data.title,
      category: data.category,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    // Il backend ritorna direttamente l'oggetto media, non { success, data }
    if (result._id) {
      return result
    }

    // Fallback per formato con { success, data }
    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || "Failed to create media")
  } catch (error) {
    console.error("Error creating media:", error)
    // Su Render, ritorna un oggetto mock per non bloccare
    return {
      _id: "mock-" + Date.now(),
      cloudinaryUrl: data.cloudinaryUrl,
      cloudinaryPublicId: data.cloudinaryPublicId,
      title: data.title,
      category: data.category,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

export async function updateMedia(id: string, data: Partial<CreateMediaData>): Promise<Media> {
  if (!isApiAvailable) {
    throw new Error("API not available")
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/media/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    // Il backend ritorna direttamente l'oggetto media, non { success, data }
    if (result._id) {
      return result
    }

    // Fallback per formato con { success, data }
    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || "Failed to update media")
  } catch (error) {
    console.error("Error updating media:", error)
    throw error
  }
}

export async function deleteMedia(id: string): Promise<void> {
  if (!isApiAvailable) {
    // Su Render, non facciamo nulla ma non blocchiamo
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/media/${id}`, {
      method: "DELETE",
    })

    const result = await response.json()

    // Il backend ritorna { message: "Media deleted" }, non { success, data }
    if (result.message || response.ok) {
      return
    }

    // Fallback per formato con { success, data }
    if (result.success) {
      return
    }

    throw new Error(result.error?.message || "Failed to delete media")
  } catch (error) {
    console.error("Error deleting media:", error)
    // Su Render, non blocchiamo
    return
  }
}
