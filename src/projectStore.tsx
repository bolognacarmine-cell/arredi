import { useEffect, useState } from "react"
import { type Project } from "./data"
import {
  getProjects as getProjectsApi,
  replaceAllProjects,
  type Project as ApiProject,
} from "./api/projectsApi"

export type ProjectRecord = Project & {
  status: "bozza" | "in lavorazione" | "completato"
  featured: boolean
}

const PROJECTS_STORAGE_KEY = "farcom-projects"
const PROJECTS_EVENT = "farcom-projects-updated"

function normalizeProject(project: Project | ApiProject, index: number): ProjectRecord {
  // Preserve original id if it exists, otherwise use _id (MongoDB compatibility)
  // Only generate a fallback if both are missing
  const id = project.id || project._id || `project-${index}`
  return {
    ...project,
    id,
    status: project.status ?? "completato",
    featured: project.featured ?? index < 6,
  }
}

// Archivio base vuoto: "Ripristina archivio base" azzera l'elenco per i
// progetti futuri, senza riportare indietro nessun esempio.
export const defaultProjects: ProjectRecord[] = []

function normalizeProjects(projects: (Project | ApiProject)[]): ProjectRecord[] {
  return projects.map(normalizeProject)
}

export function readProjects(): ProjectRecord[] {
  if (typeof window === "undefined") return defaultProjects

  try {
    const storedValue = window.localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (!storedValue) return defaultProjects

    const parsed = JSON.parse(storedValue) as Project[]
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultProjects

    // Check if any project has known missing local images
    const knownMissingImages = ['/barber-farcom1.jpg']
    const hasInvalidImages = parsed.some(p =>
      knownMissingImages.includes(p.image) ||
      p.gallery?.some(g => knownMissingImages.includes(g))
    )

    // If projects have known missing local images, clear localStorage and use defaults
    if (hasInvalidImages) {
      console.log('[projectStore] Clearing localStorage due to known missing image paths')
      window.localStorage.removeItem(PROJECTS_STORAGE_KEY)
      return defaultProjects
    }

    return normalizeProjects(parsed)
  } catch {
    return defaultProjects
  }
}

export function saveProjects(projects: ProjectRecord[]) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects))
  window.dispatchEvent(new CustomEvent(PROJECTS_EVENT))
}

export function resetProjects() {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(PROJECTS_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(PROJECTS_EVENT))
}

export async function saveProjectsToProject(projects: ProjectRecord[]) {
  return await replaceAllProjects(projects as unknown as ApiProject[])
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectRecord[]>(() => readProjects())

  useEffect(() => {
    const syncProjects = () => setProjects(readProjects())

    window.addEventListener(PROJECTS_EVENT, syncProjects)
    window.addEventListener("storage", syncProjects)

    return () => {
      window.removeEventListener(PROJECTS_EVENT, syncProjects)
      window.removeEventListener("storage", syncProjects)
    }
  }, [])

  // L'archivio remoto è la fonte di verità: un elenco vuoto significa "nessun
  // progetto", non "usa i dati di esempio" (altrimenti gli eliminati riappaiono).
  useEffect(() => {
    async function loadProjectsFromApi() {
      try {
        const apiProjects = await getProjectsApi()
        setProjects(normalizeProjects(apiProjects))
      } catch (err) {
        console.error("[projectStore] archivio remoto non raggiungibile, uso i dati locali:", err)
        setProjects(readProjects())
      }
    }

    loadProjectsFromApi()
  }, [])

  return projects
}
