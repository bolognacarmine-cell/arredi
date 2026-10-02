import { useEffect, useState, useCallback, useMemo } from "react"
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

// #region debug-point dispatch-batcher
// React 19 Error #300: batching + queueMicrotask dei dispatchEvent impedisce
// che un listener setState su un consumer diverso venga chiamato DURANTE il render
// di un altro componente. I dispatch partono DOPO il microtask corrente (post-render).
let _pendingDispatch = false
function _batchedProjectsDispatch() {
  if (_pendingDispatch) return
  _pendingDispatch = true
  // NOTA: queueMicrotask garantisce l'esecuzione dopo la fine della fase di render
  // corrente (non tra beginWork e completeWork).
  queueMicrotask(() => {
    _pendingDispatch = false
    try {
      if (typeof window !== "undefined") {
        ;(window as any).dispatchEvent(new CustomEvent(PROJECTS_EVENT))
      }
    } catch {
      /* cross-context / iframe dispatch may throw, ignore */
    }
  })
}
// #endregion

export function saveProjects(projects: ProjectRecord[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects))
  // #region debug-point save-projects-dispatch
  try {
    _batchedProjectsDispatch()
  } catch {
    /* ignore */
  }
  // #endregion
}

export function resetProjects() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(PROJECTS_STORAGE_KEY)
  // #region debug-point reset-projects-dispatch
  try {
    _batchedProjectsDispatch()
  } catch {
    /* ignore */
  }
  // #endregion
}

export async function saveProjectsToProject(projects: ProjectRecord[]) {
  const out = await replaceAllProjects(projects as unknown as ApiProject[])
  saveProjects(projects)
  return out
}

export async function loadProjectsFromApi(): Promise<{ projects: ProjectRecord[]; source: "api" | "local" }> {
  try {
    const apiProjects = await getProjectsApi()
    const normalized = normalizeProjects(apiProjects)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(normalized))
    }
    return { projects: normalized, source: "api" }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto nel caricamento progetti"
    console.error("[projectStore] archivio remoto non raggiungibile:", err)
    const local = readProjects()
    if (local.length > 0) return { projects: local, source: "local" }
    throw new Error(message)
  }
}

// Pattern ALLINEATO A showroomApi.useRemoteList<T>:
// useState + useEffect, listener (PROJECTS_EVENT, storage).
// Nessun useSyncExternalStore, nessun notify cross-store.
// Zero possibilità di React error #300.
export function useProjects(): ProjectRecord[] {
  const { projects } = useProjectsDetailed()
  return projects
}

export function useProjectsLoadState(): ProjectsLoadState {
  const { loadState } = useProjectsDetailed()
  return loadState
}

// #region debug-point consumer-counter
let _consumerCounter = 0
// #endregion

export function useProjectsDetailed(): {
  projects: ProjectRecord[]
  loadState: ProjectsLoadState
  refresh: () => Promise<void>
} {
  // #region debug-point consumer-id
  // Ogni consumer riceve un id monotono; usato solo nei trace di debug
  const consumerId = useMemo(() => `p${++_consumerCounter}`, [])
  // #endregion

  const [projects, setProjects] = useState<ProjectRecord[]>(
    typeof window !== "undefined" ? readProjects() : defaultProjects
  )
  const [loadState, setLoadState] = useState<ProjectsLoadState>({ status: "idle" })

  const refresh = useCallback(async () => {
    // #region debug-point refresh-start
    ;(console as any).debug?.('[useProjectsDetailed]', 'consumer', consumerId, 'refresh()')
    // #endregion
    setLoadState({ status: "loading" })
    try {
      const res = await loadProjectsFromApi()
      setProjects(res.projects)
      setLoadState({ status: "ready", source: res.source })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore nel caricamento"
      const local = readProjects()
      if (local.length > 0) {
        setProjects(local)
        setLoadState({ status: "ready", source: "local" })
      } else {
        setProjects(defaultProjects)
        setLoadState({ status: "error", message })
      }
    }
  }, [consumerId])

  useEffect(() => {
    // #region debug-point mount
    ;(console as any).debug?.('[useProjectsDetailed]', consumerId, 'mounted; total consumers:', _consumerCounter)
    // #endregion

    void refresh()

    const syncFromEvent = () => {
      // QueueMicrotask ANCHE sul lato consumer: evitiamo che il dispatch sincro scateni
      // setState durante un render già iniziato in corso (caso #300).
      queueMicrotask(() => {
        setProjects(readProjects())
      })
    }
    const onStorage = () => {
      queueMicrotask(() => {
        setProjects(readProjects())
      })
    }
    window.addEventListener(PROJECTS_EVENT, syncFromEvent)
    window.addEventListener("storage", onStorage)
    return () => {
      // #region debug-point unmount
      ;(console as any).debug?.('[useProjectsDetailed]', consumerId, 'unmounted')
      // #endregion
      window.removeEventListener(PROJECTS_EVENT, syncFromEvent)
      window.removeEventListener("storage", onStorage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { projects, loadState, refresh }
}
