// Su Render il backend non è disponibile, disabilitiamo le chiamate API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""
const isApiAvailable = !!API_BASE_URL

export interface Media {
  _id: string
  cloudinaryUrl: string
  cloudinaryPublicId: string
  title?: string
  category: "hero" | "sector" | "project" | "gallery"
  library?: "Tutte" | "Prodotti" | "BANNER" | "SFONDI" | "trasporto"
  tags?: string[]
  usedInProjects?: string[]
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
  library?: "Tutte" | "Prodotti" | "BANNER" | "SFONDI" | "trasporto"
  width?: number
  height?: number
  format?: string
  bytes?: number
}

export async function getMedia(filters?: {
  category?: string
  library?: string
  search?: string
}): Promise<Media[]> {
  // Helper function to get and filter localStorage data
  const getFromLocalStorage = (): Media[] => {
    if (typeof window !== "undefined") {
      try {
        const storedMedia = JSON.parse(localStorage.getItem("farcom-media-library") || "[]")
        const deletedMediaIds = JSON.parse(localStorage.getItem("farcom-deleted-media") || "[]")

        let filteredMedia = storedMedia.filter((item: Media) => !deletedMediaIds.includes(item._id))

        // Apply filters
        if (filters?.category && filters.category !== "all") {
          filteredMedia = filteredMedia.filter((item: Media) => item.category === filters.category)
        }
        if (filters?.library && filters.library !== "Tutte") {
          filteredMedia = filteredMedia.filter((item: Media) => item.library === filters.library)
        }
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase()
          filteredMedia = filteredMedia.filter((item: Media) =>
            item.cloudinaryPublicId.toLowerCase().includes(searchLower) ||
            (item.title && item.title.toLowerCase().includes(searchLower))
          )
        }

        console.log("Loaded from localStorage, total items:", filteredMedia.length)
        return filteredMedia
      } catch (error) {
        console.error("Error reading from localStorage:", error)
        return []
      }
    }
    return []
  }

  // Try API first, but fall back to localStorage on any error
  if (isApiAvailable) {
    try {
      const url = new URL(`${API_BASE_URL}/api/media`)
      if (filters?.category) url.searchParams.append("category", filters.category)
      if (filters?.library && filters.library !== "Tutte") url.searchParams.append("library", filters.library)
      if (filters?.search) url.searchParams.append("search", filters.search)

      const response = await fetch(url.toString())
      const result = await response.json()

      // Il backend ritorna direttamente l'array, non { success, data }
      let media: Media[] = []
      if (Array.isArray(result)) {
        media = result
      } else if (result.success) {
        media = result.data
      } else {
        throw new Error(result.error?.message || "Failed to fetch media")
      }

      // Filter out deleted media IDs from localStorage
      if (typeof window !== "undefined") {
        const deletedMediaIds = JSON.parse(localStorage.getItem("farcom-deleted-media") || "[]")
        media = media.filter((item) => !deletedMediaIds.includes(item._id))
      }

      return media
    } catch (error) {
      console.error("Error fetching media via API, falling back to localStorage:", error)
      // Fall back to localStorage
      return getFromLocalStorage()
    }
  }

  // API not available, use localStorage
  return getFromLocalStorage()
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
  const newMedia: Media = {
    _id: "local-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
    cloudinaryUrl: data.cloudinaryUrl,
    cloudinaryPublicId: data.cloudinaryPublicId,
    title: data.title,
    category: data.category,
    library: data.library,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Try API first, but always fall back to localStorage on any error
  if (isApiAvailable) {
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
      console.error("Error creating media via API, falling back to localStorage:", error)
      // Fall through to localStorage
    }
  }

  // Save to localStorage as fallback
  if (typeof window !== "undefined") {
    try {
      const storedMedia = JSON.parse(localStorage.getItem("farcom-media-library") || "[]")
      storedMedia.push(newMedia)
      localStorage.setItem("farcom-media-library", JSON.stringify(storedMedia))
      console.log("Media saved to localStorage as fallback, total items:", storedMedia.length)
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }
  return newMedia
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
  // Helper function to delete from localStorage
  const deleteFromLocalStorage = (): void => {
    if (typeof window !== "undefined") {
      try {
        const storedMedia = JSON.parse(localStorage.getItem("farcom-media-library") || "[]")
        const updatedMedia = storedMedia.filter((item: Media) => item._id !== id)
        localStorage.setItem("farcom-media-library", JSON.stringify(updatedMedia))
        console.log("Media deleted from localStorage")
      } catch (error) {
        console.error("Error deleting from localStorage:", error)
      }
    }
  }

  // Try API first, but fall back to localStorage on any error
  if (isApiAvailable) {
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
      console.error("Error deleting media via API, falling back to localStorage:", error)
      // Fall back to localStorage
      deleteFromLocalStorage()
      return
    }
  }

  // API not available, use localStorage
  deleteFromLocalStorage()
}
