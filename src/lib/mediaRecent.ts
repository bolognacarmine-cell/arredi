export type UploadCategory = "hero" | "sector" | "project" | "gallery"

export type RecentUpload = {
  id: string
  publicId: string
  secureUrl: string
  category: UploadCategory
  timestamp: number
  width: number
  height: number
  pendingForNextNewProject?: boolean
  titleHint?: string
  targetFieldHint?: "cover" | "gallery"
}

const RECENT_UPLOADS_KEY = "farcom-recent-uploads"

export function getRecentUploads(): RecentUpload[] {
  if (typeof window === "undefined") return []
  try {
    const stored = window.localStorage.getItem(RECENT_UPLOADS_KEY)
    if (!stored) return []
    return JSON.parse(stored) as RecentUpload[]
  } catch {
    return []
  }
}

export function saveRecentUploads(list: RecentUpload[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(RECENT_UPLOADS_KEY, JSON.stringify(list.slice(0, 40)))
}

export function saveRecentUpload(upload: RecentUpload) {
  const list = getRecentUploads()
  saveRecentUploads([upload, ...list])
}

export function clearPendingForNextNewProject() {
  const list = getRecentUploads().map((u) => ({
    ...u,
    pendingForNextNewProject: undefined,
  }))
  saveRecentUploads(list)
}

export function markPendingForNextNewProject(ids: string[]) {
  const list = getRecentUploads().map((u) =>
    ids.includes(u.id) ? { ...u, pendingForNextNewProject: true } : u,
  )
  saveRecentUploads(list)
}

export function takePendingProjectImages(): {
  cover: { secureUrl: string; publicId: string } | null
  gallery: Array<{ secureUrl: string; publicId: string }>
} {
  const list = getRecentUploads()
  const pending = list.filter((u) => u.pendingForNextNewProject)
  const cover =
    pending.find((u) => u.category === "project" && u.targetFieldHint !== "gallery") ??
    pending.find((u) => u.category === "project") ??
    null
  const gallery = pending.filter((u) => u.category === "gallery")
  const consumed = new Set<string>()
  if (cover) consumed.add(cover.id)
  gallery.forEach((g) => consumed.add(g.id))
  if (consumed.size > 0) {
    const next = list.map((u) =>
      consumed.has(u.id) ? { ...u, pendingForNextNewProject: undefined } : u,
    )
    saveRecentUploads(next)
  }
  return {
    cover: cover ? { secureUrl: cover.secureUrl, publicId: cover.publicId } : null,
    gallery: gallery.map((g) => ({ secureUrl: g.secureUrl, publicId: g.publicId })),
  }
}

export function getPendingProjectImageIds(): string[] {
  return getRecentUploads()
    .filter((u) => u.pendingForNextNewProject)
    .map((u) => u.id)
}
