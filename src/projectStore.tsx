import { useEffect, useState } from "react"
import { PROJECTS, type Project } from "./data"
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

  // Load projects from API on mount
  useEffect(() => {
    async function loadProjectsFromApi() {
      try {
        const apiProjects = await getProjectsApi()
        // If API returns empty array, fallback to default projects directly
        if (apiProjects.length === 0) {
          setProjects(defaultProjects)
        } else {
          setProjects(normalizeProjects(apiProjects))
        }
      } catch (err) {
        console.error("Error loading projects from API:", err)
        // Fallback to default projects if API fails
        setProjects(defaultProjects)
      }
    }

    loadProjectsFromApi()
  }, [])

  return projects
}
