import { getApiUrl, isApiBaseUrlConfigured } from '../lib/apiConfig'

// Allineato a productsApi.ts pattern:
// AUTH_EXPIRED standardizzato + readJson robusta + cache busting
const AUTH_EXPIRED = "Sessione admin scaduta: esegui di nuovo il login e riprova"

const hasExplicitBase = isApiBaseUrlConfigured()
const isApiAvailable = true

export function apiUrl(pathname: string): string {
  return getApiUrl(pathname)
}

// Robusta come productsApi.readJson: gestisce risposte HTML non valide (es. 502 bad gateway)
// evitando SyntaxError opachi da response.json()
async function readJson(response: Response): Promise<any> {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Risposta non valida dal server (HTTP ${response.status})`)
  }
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

// Solleva quando l'archivio non è raggiungibile; lista vuota è una risposta legittima.
export async function getProjects(): Promise<Project[]> {
  const baseUrl = apiUrl("/api/projects")
  const url = new URL(baseUrl, window.location.origin)
  // Cache buster come productsApi: evita risposte stale da CDN/Service Worker
  url.searchParams.set("_", String(Date.now()))

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Accept": "application/json" },
    credentials: 'include',
    cache: 'no-store',
  })

  if (response.status === 401 || response.status === 403) {
    throw new Error(AUTH_EXPIRED)
  }
  if (!response.ok) {
    const parsed = await readJson(response).catch(() => ({}) as any)
    throw new Error(
      parsed?.message || parsed?.error || `Archivio progetti non disponibile (HTTP ${response.status})`
    )
  }
  const result = await readJson(response).catch(() => [])

  if (Array.isArray(result)) return result
  if (Array.isArray(result?.data)) return result.data
  if (result && typeof result === "object" && (result as any)._id) return [result as Project]
  return []
}

export async function getProjectById(id: string): Promise<Project> {
  try {
    const response = await fetch(apiUrl(`/api/projects/${encodeURIComponent(id)}`), {
      method: "GET",
      headers: { "Accept": "application/json" },
      credentials: 'include',
    })
    if (response.status === 401 || response.status === 403) throw new Error(AUTH_EXPIRED)
    const result = await readJson(response).catch(() => ({}))
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
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (response.status === 401 || response.status === 403) throw new Error(AUTH_EXPIRED)
    const result = await readJson(response).catch(() => ({}))
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
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (response.status === 401 || response.status === 403) throw new Error(AUTH_EXPIRED)
    const result = await readJson(response).catch(() => ({}))
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
      credentials: 'include',
    })
    if (response.status === 401 || response.status === 403) throw new Error(AUTH_EXPIRED)
    const result = await response.json().catch(() => null)
    if (!response.ok && result?.error) {
      throw new Error(result.error.message || "Failed to delete project")
    }
  } catch (error) {
    console.error("Error deleting project:", error)
    throw error
  }
}

export async function replaceAllProjects(projects: Project[]): Promise<{ ok: true; filePath: string; backupPath: string | null }> {
  const endpoints = import.meta.env.MODE === 'production'
    ? ["/api/projects/batch", "/api/projects/replace-all"] as const
    : ["/__admin/projects", "/api/projects/batch", "/api/projects/replace-all"] as const

  let lastErr: unknown = null

  for (const url of endpoints) {
    try {
      const fullUrl = apiUrl(url)
      console.log('[Projects API] Trying endpoint:', fullUrl, 'with', projects.length, 'projects')
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: 'include',
        body: JSON.stringify(projects),
      })
      console.log('[Projects API] Response status:', response.status, 'for endpoint:', url)

      if (response.status === 401 || response.status === 403) {
        throw new Error(AUTH_EXPIRED)
      }
      if (response.status === 404 || response.status === 405) {
        console.log('[Projects API] Endpoint not available, trying next:', url)
        continue
      }
      if (!response.ok) {
        const parsed = await readJson(response).catch(() => null)
        const msg = parsed?.error?.message || parsed?.message || `HTTP ${response.status}`
        console.error('[Projects API] Error for endpoint:', url, 'Error:', msg)
        lastErr = new Error(msg)
        if (response.status >= 500 && response.status !== 503) continue
        throw lastErr
      }
      const json = await readJson(response).catch(() => ({})) as any
      console.log('[Projects API] Success with endpoint:', url)
      return {
        ok: true,
        filePath: json?.filePath || url,
        backupPath: json?.backupPath || null,
      }
    } catch (e) {
      console.error('[Projects API] Exception for endpoint:', url, e)
      lastErr = e
      if (e instanceof Error && e.message === AUTH_EXPIRED) throw e
    }
  }

  console.error('[Projects API] All endpoints failed')
  throw lastErr instanceof Error ? lastErr : new Error("Nessun endpoint di salvataggio progetti disponibile.")
}
