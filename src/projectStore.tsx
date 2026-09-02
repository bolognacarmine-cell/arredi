import { useEffect, useState } from "react"
import { PROJECTS, type Project } from "./data"
import { getProjects as getProjectsApi, type Project as ApiProject } from "./api/projectsApi"

export type ProjectRecord = Project & {
  status: "bozza" | "in lavorazione" | "completato"
  featured: boolean
}

const PROJECTS_STORAGE_KEY = "farcom-projects"
const PROJECTS_EVENT = "farcom-projects-updated"
const PROJECTS_API_PATH = "/__admin/projects"

function normalizeProject(project: Project | ApiProject, index: number): ProjectRecord {
  return {
    ...project,
    status: project.status ?? "completato",
    featured: project.featured ?? index < 6,
  }
}

export const defaultProjects: ProjectRecord[] = PROJECTS.map(normalizeProject)

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
  const response = await fetch(PROJECTS_API_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projects),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Salvataggio progetti non riuscito.")
  }

  return (await response.json()) as {
    ok: true
    filePath: string
    backupPath: string | null
  }
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

  // Load projects from API on mount
  useEffect(() => {
    async function loadProjectsFromApi() {
      try {
        const apiProjects = await getProjectsApi()
        setProjects(normalizeProjects(apiProjects))
      } catch (err) {
        console.error("Error loading projects from API:", err)
        // Fallback to localStorage if API fails
        setProjects(readProjects())
      }
    }

    loadProjectsFromApi()
  }, [])

  return projects
}
