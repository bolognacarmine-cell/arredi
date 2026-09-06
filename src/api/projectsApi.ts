// Su Render il backend non è disponibile, disabilitiamo le chiamate API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""
const isApiAvailable = !!API_BASE_URL

export interface Project {
  _id: string
  id: string
  title: string
  sector: string
  sectorId: string
  location: string
  year: number
  client?: string
  description: string
  image: string
  imageCloudinaryPublicId?: string
  gallery: string[]
  galleryCloudinaryPublicIds?: string[]
  tags: string[]
  materials: string
  status?: "bozza" | "in lavorazione" | "completato"
  featured?: boolean
  seo?: {
    metaTitle: string
    metaDescription: string
    slug: string
  }
  createdAt: string
  updatedAt: string
}

export async function getProjects(): Promise<Project[]> {
  if (!isApiAvailable) {
    return []
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`)
    const result = await response.json()

    if (Array.isArray(result)) {
      return result
    }

    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || "Failed to fetch projects")
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function getProjectById(id: string): Promise<Project> {
  if (!isApiAvailable) {
    throw new Error("API not available")
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`)
    const result = await response.json()

    if (result._id) {
      return result
    }

    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || "Failed to fetch project")
  } catch (error) {
    console.error("Error fetching project:", error)
    throw error
  }
}

export async function createProject(data: Omit<Project, "_id" | "createdAt" | "updatedAt">): Promise<Project> {
  if (!isApiAvailable) {
    throw new Error("API not available")
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result._id) {
      return result
    }

    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || "Failed to create project")
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
  }
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  if (!isApiAvailable) {
    throw new Error("API not available")
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result._id) {
      return result
    }

    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || "Failed to update project")
  } catch (error) {
    console.error("Error updating project:", error)
    throw error
  }
}

export async function deleteProject(id: string): Promise<void> {
  if (!isApiAvailable) {
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: "DELETE",
    })

    const result = await response.json()

    if (result.message || response.ok) {
      return
    }

    if (result.success) {
      return
    }

    throw new Error(result.error?.message || "Failed to delete project")
  } catch (error) {
    console.error("Error deleting project:", error)
    return
  }
}
