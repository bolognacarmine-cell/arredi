import { useEffect, useState, useSyncExternalStore } from "react"
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

export type ProjectsLoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; source: "api" | "local" }
  | { status: "error"; message: string }

type AnyProject = Project | ApiProject

function pickGallery(p: AnyProject): string[] {
  const apiProj = p as Partial<ApiProject>
  const localProj = p as Partial<Project>
  if (Array.isArray(localProj.galleryImages)) return localProj.galleryImages
  if (Array.isArray(apiProj.gallery)) return apiProj.gallery
  return []
}

function normalizeProject(project: AnyProject, index: number): ProjectRecord {
  const anyProj = project as any
  const id = project.id || anyProj._id || `project-${index}`
  const galleryImages = pickGallery(project)
  const coverImages =
    Array.isArray((project as Partial<ProjectRecord>).coverImages) &&
    (project as Partial<ProjectRecord>).coverImages!.length > 0
      ? (project as Partial<ProjectRecord>).coverImages!
      : galleryImages

  return {
    ...(project as Project),
    _id: anyProj._id,
    id,
    galleryImages,
    coverImages,
    status: (project as Partial<ProjectRecord>).status ?? "completato",
    featured: (project as Partial<ProjectRecord>).featured ?? index < 6,
  }
}

export const defaultProjects: ProjectRecord[] = []

function normalizeProjects(projects: AnyProject[]): ProjectRecord[] {
  return projects.map(normalizeProject)
}

export function readProjects(): ProjectRecord[] {
  if (typeof window === "undefined") return defaultProjects

  try {
    const storedValue = window.localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (!storedValue) return defaultProjects

    const parsed = JSON.parse(storedValue) as AnyProject[]
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultProjects

    const knownMissingImages = ['/barber-farcom1.jpg']
    const hasInvalidImages = parsed.some((p: AnyProject) => {
      const image = (p as Partial<Project>).image as string
      const gallery = pickGallery(p)
      return (
        (image && knownMissingImages.includes(image)) ||
        gallery.some((g: string) => knownMissingImages.includes(g))
      )
    })

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

type StoreState = {
  projects: ProjectRecord[]
  loadState: ProjectsLoadState
  authEnabled: boolean
}

let storeState: StoreState = {
  projects: typeof window !== "undefined" ? readProjects() : defaultProjects,
  loadState: { status: "idle" },
  authEnabled: true,
}

const subscribers = new Set<() => void>()
let notifyScheduled = false
function notify() {
  if (notifyScheduled) return
  notifyScheduled = true
  // Tutte le notifiche ai subscriber React passano per queueMicrotask:
  // questo garantisce che siano SEMPRE fuori da una fase di render,
  // impedendo il React 19 error #300 ("setState during render of another component")
  // anche in caso di StrictMode o rendering concorrente.
  queueMicrotask(() => {
    notifyScheduled = false
    subscribers.forEach((s: () => void) => s())
  })
}

export function setProjectStoreAuthReady(ready: boolean) {
  if (storeState.authEnabled === ready) return
  storeState = { ...storeState, authEnabled: ready }
  notify()
  if (ready && storeState.loadState.status === "idle") {
    void loadProjectsFromApi()
  }
}

export function getProjectLoadState(): ProjectsLoadState {
  return storeState.loadState
}

export async function loadProjectsFromApi() {
  if (!storeState.authEnabled) {
    console.log('[projectStore] Auth not ready: skip API fetch')
    return
  }

  storeState = { ...storeState, loadState: { status: "loading" } }
  notify()

  try {
    const apiProjects = await getProjectsApi()
    const normalized = normalizeProjects(apiProjects)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(normalized))
    }
    storeState = {
      projects: normalized,
      loadState: { status: "ready", source: "api" },
      authEnabled: storeState.authEnabled,
    }
    notify()
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Errore sconosciuto nel caricamento progetti"
    console.error("[projectStore] archivio remoto non raggiungibile:", err)

    const local = readProjects()
    storeState = {
      projects: local,
      loadState:
        local.length > 0
          ? { status: "ready", source: "local" }
          : { status: "error", message },
      authEnabled: storeState.authEnabled,
    }
    notify()
  }
}

export function useProjects(): ProjectRecord[] {
  const state = useSyncExternalStore<StoreState>(
    (cb: () => void) => {
      subscribers.add(cb)
      return () => subscribers.delete(cb)
    },
    () => storeState,
    () => storeState,
  )

  const [, setTick] = useState<number>(0)
  useEffect(() => {
    const syncProjects = () => {
      storeState = { ...storeState, projects: readProjects() }
      setTick((t: number) => t + 1)
      notify()
    }
    const onStorage = () => syncProjects()
    window.addEventListener(PROJECTS_EVENT, syncProjects)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener(PROJECTS_EVENT, syncProjects)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  useEffect(() => {
    if (storeState.authEnabled && storeState.loadState.status === "idle") {
      void loadProjectsFromApi()
    }
  }, [])

  return state.projects
}

export function useProjectsLoadState(): ProjectsLoadState {
  return useSyncExternalStore<ProjectsLoadState>(
    (cb: () => void) => {
      subscribers.add(cb)
      return () => subscribers.delete(cb)
    },
    () => storeState.loadState,
    () => storeState.loadState,
  )
}
