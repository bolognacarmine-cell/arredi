// API_BASE_URL opzionale: se non impostato, usa percorsi relativi sullo stesso dominio (es. /api/projects)
// Funziona in locale (proxy/express) e in produzione (Render con backend + fallback SPA)
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "")
const hasExplicitBase = !!import.meta.env.VITE_API_BASE_URL
const isApiAvailable = true

export function apiUrl(pathname: string): string {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`
  if (hasExplicitBase) return `${API_BASE_URL}${clean}`
  return clean
}

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
  try {
    const response = await fetch(apiUrl("/api/projects"), {
      method: "GET",
      headers: { "Accept": "application/json" },
    })
    if (!response.ok) {
      if (response.status === 404 || response.status === 503 || response.status >= 500) {
        return []
      }
    }
    const result = await response.json().catch(() => ({}))

    if (Array.isArray(result)) return result
    if (Array.isArray(result?.data)) return result.data
    if (result && typeof result === "object" && (result as any)._id) return [result as Project]
    return []
  } catch (error) {
    console.warn("[projectsApi] getProjects fallito (frontend userà localStorage/data.ts):", error instanceof Error ? error.message : error)
    return []
  }
}

export async function getProjectById(id: string): Promise<Project> {
  try {
    const response = await fetch(apiUrl(`/api/projects/${encodeURIComponent(id)}`), {
      method: "GET",
      headers: { "Accept": "application/json" },
    })
    const result = await response.json().catch(() => ({}))
    if (response.ok && (result._id || result.id || result?.data?._id)) {
      return (result._id || result.id) ? (result as Project) : (result.data as Project)
    }
    throw new Error(result?.error?.message || result?.message || "Failed to fetch project")
  } catch (error) {
    console.error("Error fetching project:", error)
    throw error
  }
}

export async function createProject(data: Omit<Project, "_id" | "createdAt" | "updatedAt">): Promise<Project> {
  try {
    const response = await fetch(apiUrl("/api/projects"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result?.error?.message || result?.message || "Failed to create project")
    if (result._id || result.id) return result as Project
    if (result?.data?._id) return result.data as Project
    throw new Error("Invalid project payload from server")
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
  }
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  try {
    const response = await fetch(apiUrl(`/api/projects/${encodeURIComponent(id)}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result?.error?.message || result?.message || "Failed to update project")
    if (result._id || result.id) return result as Project
    if (result?.data?._id) return result.data as Project
    throw new Error("Invalid project payload from server")
  } catch (error) {
    console.error("Error updating project:", error)
    throw error
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const response = await fetch(apiUrl(`/api/projects/${encodeURIComponent(id)}`), {
      method: "DELETE",
      headers: { Accept: "application/json" },
    })
    const result = await response.json().catch(() => null)
    if (!response.ok && result?.error) {
      throw new Error(result.error.message || "Failed to delete project")
    }
  } catch (error) {
    console.error("Error deleting project:", error)
    return
  }
}

export async function replaceAllProjects(projects: Project[]): Promise<{ ok: true; filePath: string; backupPath: string | null }> {
  const endpoints = ["/__admin/projects", "/api/projects/batch", "/api/projects/replace-all"] as const
  let lastErr: unknown = null

  for (const url of endpoints) {
    try {
      const fullUrl = apiUrl(url)
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(projects),
      })
      if (response.status === 404 || response.status === 405) {
        continue
      }
      if (!response.ok) {
        const txt = await response.text().catch(() => "")
        const parsed = (() => {
          try { return JSON.parse(txt) } catch { return null }
        })()
        const msg = parsed?.error?.message || txt.slice(0, 160) || `HTTP ${response.status}`
        lastErr = new Error(msg)
        if (response.status >= 500 && response.status !== 503) continue
        throw lastErr
      }
      const json = await response.json().catch(() => ({})) as any
      return {
        ok: true,
        filePath: json?.filePath || url,
        backupPath: json?.backupPath || null,
      }
    } catch (e) {
      lastErr = e
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("Nessun endpoint di salvataggio progetti disponibile.")
}
