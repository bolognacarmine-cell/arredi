import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { SECTORS } from "../../data"
import {
  defaultProjects,
  resetProjects,
  saveProjects,
  saveProjectsToProject,
  useProjects,
  type ProjectRecord,
} from "../../projectStore"
import Loading from "../../components/Loading"
import {
  getRecentUploads,
  takePendingProjectImages,
  type RecentUpload,
} from "../../lib/mediaRecent"
import { resolveImageUrl } from "../../lib/cloudinary"

const statusColor: Record<ProjectRecord["status"], string> = {
  "in lavorazione": "bg-amber-100 text-amber-700",
  completato: "bg-green-100 text-green-700",
  bozza: "bg-gray-100 text-gray-600",
}

type FormState = {
  titolo: string
  settore: string
  cliente: string
  citta: string
  anno: string
  stato: ProjectRecord["status"]
  descrizione: string
  evidenza: boolean
  immagine: string
  imageCloudinaryPublicId: string
  materiali: string
  tagText: string
  galleryText: string
  galleryCloudinaryPublicIdsText: string
  seoMetaTitle: string
  seoMetaDescription: string
  seoSlug: string
}

const emptyForm: FormState = {
  titolo: "",
  settore: "",
  cliente: "",
  citta: "",
  anno: "2025",
  stato: "bozza",
  descrizione: "",
  evidenza: false,
  immagine: "",
  imageCloudinaryPublicId: "",
  materiali: "",
  tagText: "",
  galleryText: "",
  galleryCloudinaryPublicIdsText: "",
  seoMetaTitle: "",
  seoMetaDescription: "",
  seoSlug: "",
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function projectToForm(project: ProjectRecord): FormState {
  return {
    titolo: project.title,
    settore: project.sectorId,
    cliente: project.client ?? "",
    citta: project.location,
    anno: String(project.year),
    stato: project.status,
    descrizione: project.description,
    evidenza: project.featured,
    immagine: project.image,
    imageCloudinaryPublicId: project.imageCloudinaryPublicId ?? "",
    materiali: project.materials,
    tagText: project.tags.join(", "),
    galleryText: project.gallery.join("\n"),
    galleryCloudinaryPublicIdsText: (project.galleryCloudinaryPublicIds ?? []).join("\n"),
    seoMetaTitle: project.seo?.metaTitle ?? "",
    seoMetaDescription: project.seo?.metaDescription ?? "",
    seoSlug: project.seo?.slug ?? "",
  }
}

function toProjectRecord(
  form: FormState,
  currentProjects: ProjectRecord[],
  editingId: string | null,
): ProjectRecord {
  const selectedSector = SECTORS.find((sector) => sector.id === form.settore)
  const fallbackId = `${form.settore || "progetto"}-${slugify(form.titolo || "nuovo-progetto")}`
  const nextId = editingId ?? fallbackId
  const uniqueId = editingId
    ? editingId
    : currentProjects.some((project) => project.id === nextId)
      ? `${nextId}-${Date.now()}`
      : nextId
  const gallery = form.galleryText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
  const normalizedGallery =
    gallery.length > 0
      ? gallery
      : form.immagine.trim()
        ? [form.immagine.trim()]
        : ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop"]

  const galleryPublicIdsRaw = form.galleryCloudinaryPublicIdsText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
  const galleryCloudinaryPublicIds: string[] | undefined =
    galleryPublicIdsRaw.length > 0
      ? normalizedGallery.map((_, i) => galleryPublicIdsRaw[i] ?? "")
      : undefined

  const imageCloudinaryPublicId = form.imageCloudinaryPublicId.trim() || undefined

  const seoSlug = form.seoSlug.trim() || slugify(form.titolo || "")
  const seoMetaTitle = form.seoMetaTitle.trim() || form.titolo.trim()
  const seoMetaDescription = form.seoMetaDescription.trim() || form.descrizione.trim().substring(0, 160)

  return {
    id: uniqueId,
    title: form.titolo.trim(),
    sector: selectedSector?.label ?? "Settore da definire",
    sectorId: form.settore,
    location: form.citta.trim(),
    year: Number(form.anno) || new Date().getFullYear(),
    client: form.cliente.trim() || undefined,
    description: form.descrizione.trim(),
    image: form.immagine.trim() || normalizedGallery[0],
    imageCloudinaryPublicId,
    gallery: normalizedGallery,
    galleryCloudinaryPublicIds,
    tags: form.tagText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    materials: form.materiali.trim() || "Materiali da definire",
    status: form.stato,
    featured: form.evidenza,
    seo: {
      metaTitle: seoMetaTitle,
      metaDescription: seoMetaDescription,
      slug: seoSlug,
    },
  }
}

export default function AdminProjects() {
  const { id: routeId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const projects = useProjects()
  const [filter, setFilter] = useState("all")
  const [stateFilter, setStateFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusTone, setStatusTone] = useState<"success" | "warning">("success")
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [autoLoadedImagesCount, setAutoLoadedImagesCount] = useState<number>(0)
  const [showMediaPicker, setShowMediaPicker] = useState<
    "cover" | "gallery" | null
  >(null)
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([])
  const [galleryDragIndex, setGalleryDragIndex] = useState<number | null>(null)

  useEffect(() => {
    const isNuovo = location.pathname === "/admin/progetti/nuovo"
    if (isNuovo) {
      const pending = takePendingProjectImages()
      const gallery =
        pending.gallery.length > 0
          ? pending.gallery.map((g) => g.secureUrl).join("\n")
          : ""
      const galleryPids =
        pending.gallery.length > 0
          ? pending.gallery.map((g) => g.publicId).join("\n")
          : ""
      const loadedCount =
        (pending.cover ? 1 : 0) + pending.gallery.length
      setAutoLoadedImagesCount(loadedCount)
      setEditingId(null)
      setForm({
        ...emptyForm,
        immagine: pending.cover?.secureUrl ?? "",
        imageCloudinaryPublicId: pending.cover?.publicId ?? "",
        galleryText: gallery,
        galleryCloudinaryPublicIdsText: galleryPids,
      })
      setShowForm(true)
    } else if (routeId) {
      const existing = projects.find((project) => project.id === routeId)
      if (existing) {
        setEditingId(existing.id)
        setForm(projectToForm(existing))
        setShowForm(true)
      }
      setAutoLoadedImagesCount(0)
    } else {
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      setAutoLoadedImagesCount(0)
    }
  }, [location.pathname, routeId, projects])

  useEffect(() => {
    if (showForm || showMediaPicker) {
      setRecentUploads(getRecentUploads())
    }
  }, [showForm, showMediaPicker])

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }))

  const galleryItems = useMemo<
    Array<{ url: string; publicId: string }>
  >(() => {
    const urls = form.galleryText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    const pids = form.galleryCloudinaryPublicIdsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    return urls.map((url, i) => ({ url, publicId: pids[i] ?? "" }))
  }, [form.galleryText, form.galleryCloudinaryPublicIdsText])

  const writeGalleryItems = (
    items: Array<{ url: string; publicId: string }>,
  ) => {
    setForm((current) => ({
      ...current,
      galleryText: items.map((it) => it.url).join("\n"),
      galleryCloudinaryPublicIdsText: items
        .map((it) => it.publicId)
        .join("\n"),
    }))
  }

  const pickAsCover = (upload: RecentUpload) => {
    setForm((current) => ({
      ...current,
      immagine: upload.secureUrl,
      imageCloudinaryPublicId: upload.publicId,
    }))
    setShowMediaPicker(null)
  }

  const addToGallery = (upload: RecentUpload) => {
    const next = [
      ...galleryItems,
      { url: upload.secureUrl, publicId: upload.publicId },
    ]
    writeGalleryItems(next)
  }

  const removeFromGallery = (index: number) => {
    const next = galleryItems.filter((_, i) => i !== index)
    writeGalleryItems(next)
  }

  const moveInGallery = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return
    if (to >= galleryItems.length) return
    const next = [...galleryItems]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    writeGalleryItems(next)
  }

  const setCoverFromGalleryIndex = (index: number) => {
    const item = galleryItems[index]
    if (!item) return
    setForm((current) => ({
      ...current,
      immagine: item.url,
      imageCloudinaryPublicId: item.publicId,
    }))
  }

  const filtered = projects
    .filter((project) => filter === "all" || project.sectorId === filter)
    .filter((project) => stateFilter === "all" || project.status === stateFilter)

  const showSavedState = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return

    const draggedIndex = filtered.findIndex((p) => p.id === draggedId)
    const targetIndex = filtered.findIndex((p) => p.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newProjects = [...projects]
    const [draggedProject] = newProjects.splice(draggedIndex, 1)
    newProjects.splice(targetIndex, 0, draggedProject)

    saveProjects(newProjects)
    setDraggedId(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  const showStatus = (message: string, tone: "success" | "warning") => {
    setStatusMessage(message)
    setStatusTone(tone)
  }

  const openCreateForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const closeForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(false)
    if (routeId) {
      navigate("/admin/progetti", { replace: true })
    }
  }

  const persistProjects = async (
    nextProjects: ProjectRecord[],
    successMessage: string,
    fallbackMessage: string,
  ) => {
    try {
      await saveProjectsToProject(nextProjects)
      saveProjects(nextProjects)
      showStatus(successMessage, "success")
    } catch {
      saveProjects(nextProjects)
      showStatus(fallbackMessage, "warning")
    }

    showSavedState()
  }

  const handleSave = async () => {
    setIsSaving(true)
    const nextProject = toProjectRecord(form, projects, editingId)
    const nextProjects = editingId
      ? projects.map((project) => (project.id === editingId ? nextProject : project))
      : [nextProject, ...projects]

    await persistProjects(
      nextProjects,
      editingId
        ? "Progetto aggiornato nel progetto e sincronizzato nel browser."
        : "Nuovo progetto salvato nel progetto e sincronizzato nel browser.",
      editingId
        ? "Modifica salvata solo nel browser corrente."
        : "Nuovo progetto salvato solo nel browser corrente.",
    )

    setIsSaving(false)
    closeForm()
  }

  const handleEdit = (project: ProjectRecord) => {
    setEditingId(project.id)
    setForm(projectToForm(project))
    setShowForm(true)
  }

  const handleDelete = async (projectId: string) => {
    const project = projects.find((item) => item.id === projectId)
    if (!project) return
    if (!window.confirm(`Eliminare il progetto "${project.title}"?`)) return

    setIsDeleting(true)
    const nextProjects = projects.filter((item) => item.id !== projectId)

    await persistProjects(
      nextProjects,
      "Progetto eliminato e archivio aggiornato nel progetto.",
      "Progetto eliminato solo nel browser corrente.",
    )
    setIsDeleting(false)
  }

  const handleReset = async () => {
    if (!window.confirm("Ripristinare l'archivio progetti di base?")) return

    try {
      await saveProjectsToProject(defaultProjects)
      resetProjects()
      showStatus("Archivio progetti ripristinato nel progetto.", "success")
    } catch {
      saveProjects(defaultProjects)
      showStatus(
        "Ripristino applicato solo nel browser corrente.",
        "warning",
      )
    }

    showSavedState()
    closeForm()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-[#1A1A18]">
            Progetti
          </h1>
          <p className="mt-0.5 text-sm text-[#888580]">
            {projects.length} progetti totali
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleReset}
            className="border border-[#DDD9D0] px-5 py-2.5 text-sm font-medium text-[#4A4A46] transition-colors hover:border-[#1B4332] hover:text-[#1B4332]"
          >
            Ripristina archivio base
          </button>
          <button
            onClick={openCreateForm}
            className="bg-[#1B4332] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#143326]"
          >
            + Nuovo progetto
          </button>
        </div>
      </div>

      <div className="mb-6 border border-[#DDD9D0] bg-[#F7F5F0] p-4 text-sm text-[#4A4A46]">
        In sviluppo i progetti vengono salvati direttamente in
        <span className="font-medium text-[#1A1A18]"> `src/data.ts` </span>
        con backup automatico. Se il file non e scrivibile, il pannello usa il
        fallback nel browser.
      </div>

      {showForm && (
        <div className="mb-8 border border-[#DDD9D0] bg-white p-6 animate-fade-in">
          <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-display text-xl font-medium text-[#1A1A18]">
              {editingId ? "Modifica progetto" : "Nuovo progetto"}
            </h2>
            <div className="flex items-center gap-3">
              {!editingId && autoLoadedImagesCount > 0 && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B4332]/10 text-[#1B4332] text-xs font-semibold">
                  <span>📸</span> {autoLoadedImagesCount} foto{" "}
                  {autoLoadedImagesCount === 1 ? "caricata" : "caricate"}
                  &nbsp;automaticamente dalla Libreria Media
                </span>
              )}
              <button
                onClick={closeForm}
                className="text-sm text-[#888580] transition-colors hover:text-[#1A1A18]"
              >
                ✕ Chiudi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {([
              ["titolo", "Titolo"],
              ["cliente", "Cliente"],
              ["citta", "Città"],
              ["materiali", "Materiali"],
            ] as const).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                  {label}
                </label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs uppercase tracking-wide text-[#888580]">
                  Immagine copertina
                </label>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker("cover")}
                  className="text-xs text-[#1B4332] font-medium hover:underline"
                >
                  🖼️ Scegli dalla Libreria Media
                </button>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-32 w-44 flex-shrink-0 overflow-hidden border border-[#DDD9D0] bg-[#F7F5F0] flex items-center justify-center">
                  {form.immagine ? (
                    <img
                      src={resolveImageUrl(
                        {
                          src: form.immagine,
                          publicId: form.imageCloudinaryPublicId || null,
                        },
                        { width: 480, height: 320, objectFit: "cover" },
                      )}
                      alt="Copertina"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-[#888580] px-2 text-center">
                      Nessuna immagine
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={form.immagine}
                    onChange={(e) => set("immagine", e.target.value)}
                    placeholder="Oppure incolla qui l'URL immagine"
                    className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={form.imageCloudinaryPublicId}
                    onChange={(e) =>
                      set("imageCloudinaryPublicId", e.target.value)
                    }
                    placeholder="Cloudinary Public ID (opzionale)"
                    className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Settore
              </label>
              <select
                value={form.settore}
                onChange={(e) => set("settore", e.target.value)}
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
              >
                <option value="">Seleziona...</option>
                {SECTORS.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Anno
              </label>
              <input
                type="number"
                value={form.anno}
                onChange={(e) => set("anno", e.target.value)}
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Stato
              </label>
              <select
                value={form.stato}
                onChange={(e) =>
                  set("stato", e.target.value as ProjectRecord["status"])
                }
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
              >
                <option value="bozza">Bozza</option>
                <option value="in lavorazione">In lavorazione</option>
                <option value="completato">Completato</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Descrizione
              </label>
              <textarea
                rows={4}
                value={form.descrizione}
                onChange={(e) => set("descrizione", e.target.value)}
                className="w-full resize-none border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Tag separati da virgola
              </label>
              <input
                type="text"
                value={form.tagText}
                onChange={(e) => set("tagText", e.target.value)}
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <label className="block text-xs uppercase tracking-wide text-[#888580]">
                  Gallery Progetto
                  {galleryItems.length > 0 && (
                    <span className="ml-2 text-[#1B4332] font-medium normal-case">
                      · {galleryItems.length}{" "}
                      {galleryItems.length === 1 ? "immagine" : "immagini"} ·
                      diventeranno un{" "}
                      <strong>carosello</strong> nel dettaglio progetto
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker("gallery")}
                  className="text-xs text-[#1B4332] font-medium hover:underline"
                >
                  ＋ Aggiungi da Libreria Media
                </button>
              </div>

              {galleryItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-3">
                  {galleryItems.map((item, i) => (
                    <div
                      key={`${item.url}-${i}`}
                      draggable
                      onDragStart={() => setGalleryDragIndex(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (galleryDragIndex !== null) {
                          moveInGallery(galleryDragIndex, i)
                        }
                        setGalleryDragIndex(null)
                      }}
                      onDragEnd={() => setGalleryDragIndex(null)}
                      className={`relative aspect-square overflow-hidden border bg-[#F7F5F0] transition-all group ${
                        galleryDragIndex === i
                          ? "opacity-40 scale-95"
                          : "border-[#DDD9D0] hover:border-[#1B4332] cursor-move"
                      }`}
                    >
                      <img
                        src={resolveImageUrl(
                          { src: item.url, publicId: item.publicId || null },
                          { width: 360, height: 360, objectFit: "cover" },
                        )}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-white/90 backdrop-blur px-1.5 py-0.5 text-[10px] font-medium text-[#4A4A46]">
                        {i === 0 ? "Cover · 1" : i + 1}
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex flex-col gap-1.5">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => setCoverFromGalleryIndex(i)}
                              className="bg-white text-[#1B4332] text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap"
                            >
                              ⭐ Imposta copertina
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFromGallery(i)}
                            className="bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap"
                          >
                            ✕ Rimuovi
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#DDD9D0] bg-[#F7F5F0] p-6 text-center mb-3">
                  <div className="text-4xl text-[#DDD9D0] mb-2">🎞️</div>
                  <p className="text-sm text-[#4A4A46] mb-1">
                    Nessuna immagine nella gallery
                  </p>
                  <p className="text-xs text-[#888580]">
                    Clicca &quot;＋ Aggiungi da Libreria Media&quot; per caricare foto
                    dal Media Manager — o incolla gli URL nel campo sotto.
                  </p>
                </div>
              )}

              <details className="border border-[#EAE7E0] bg-[#FAFAF7] rounded">
                <summary className="px-3 py-2 text-xs cursor-pointer text-[#888580] hover:text-[#1A1A18]">
                  ⚙️ Modo manuale: URL Gallery e Public ID
                </summary>
                <div className="p-3 pt-1 space-y-3">
                  <textarea
                    rows={3}
                    value={form.galleryText}
                    onChange={(e) => set("galleryText", e.target.value)}
                    placeholder="URL immagini, una per riga"
                    className="w-full resize-none border border-[#DDD9D0] bg-white px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    value={form.galleryCloudinaryPublicIdsText}
                    onChange={(e) =>
                      set("galleryCloudinaryPublicIdsText", e.target.value)
                    }
                    placeholder="Cloudinary Public ID · Gallery (uno per riga, stesso ordine delle URL sopra)"
                    className="w-full resize-none border border-[#DDD9D0] bg-white px-3 py-2 text-xs text-[#1A1A18] focus:border-[#1B4332] focus:outline-none font-mono"
                  />
                </div>
              </details>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#4A4A46] mb-1.5">
                SEO
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#888580] mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={form.seoMetaTitle}
                    onChange={(e) => set("seoMetaTitle", e.target.value)}
                    placeholder="Titolo per SEO (es: The Craft Barbershop - Farcom)"
                    className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888580] mb-1">Slug</label>
                  <input
                    type="text"
                    value={form.seoSlug}
                    onChange={(e) => set("seoSlug", e.target.value)}
                    placeholder="URL slug (es: the-craft-barbershop)"
                    className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-[#888580] mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={form.seoMetaDescription}
                  onChange={(e) => set("seoMetaDescription", e.target.value)}
                  placeholder="Descrizione per SEO (max 160 caratteri)"
                  maxLength={160}
                  className="w-full resize-none border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
                />
                <div className="text-xs text-[#888580] mt-1">
                  {form.seoMetaDescription.length}/160
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="evidenza"
                checked={form.evidenza}
                onChange={(e) => set("evidenza", e.target.checked)}
                className="h-4 w-4 accent-[#1B4332]"
              />
              <label htmlFor="evidenza" className="text-sm text-[#4A4A46]">
                Mostra in evidenza nella home
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#1B4332] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#143326] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loading size="sm" />
                  Salvataggio...
                </>
              ) : saved ? (
                "✓ Salvato"
              ) : editingId ? (
                "Aggiorna progetto"
              ) : (
                "Salva progetto"
              )}
            </button>
            <button
              onClick={closeForm}
              disabled={isSaving}
              className="border border-[#DDD9D0] px-5 py-2.5 text-sm text-[#4A4A46] transition-colors hover:bg-[#EAE7E0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annulla
            </button>
          </div>

          {showMediaPicker && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white w-full max-w-5xl max-h-[85vh] overflow-hidden border border-[#DDD9D0] shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE7E0]">
                  <div>
                    <h3 className="font-display text-lg font-medium text-[#1A1A18]">
                      {showMediaPicker === "cover"
                        ? "Scegli immagine di copertina"
                        : "Aggiungi immagini alla Gallery"}
                    </h3>
                    <p className="text-xs text-[#888580] mt-0.5">
                      {showMediaPicker === "cover"
                        ? "Clicca su una foto per usarla come copertina del progetto"
                        : "Clicca su una o più foto per aggiungerle alla gallery (il carosello del progetto)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#888580]">
                      {recentUploads.length}{" "}
                      {recentUploads.length === 1
                        ? "elemento"
                        : "elementi"}
                      {" "}nella libreria
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(null)}
                      className="text-sm text-[#888580] hover:text-[#1A1A18] transition-colors"
                    >
                      ✕ Chiudi
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 bg-[#F7F5F0]">
                  {recentUploads.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-5xl text-[#DDD9D0] mb-4">🗂️</div>
                      <p className="text-[#4A4A46] mb-2">
                        Libreria Media ancora vuota
                      </p>
                      <p className="text-xs text-[#888580] mb-4">
                        Vai in{" "}
                        <span className="font-medium">
                          Admin → Libreria Media
                        </span>{" "}
                        per caricare le prime immagini su Cloudinary.
                      </p>
                      <Link
                        to="/admin/media"
                        className="inline-block bg-[#1B4332] text-white text-sm px-4 py-2 hover:bg-[#143326] transition-colors"
                      >
                        → Vai a Libreria Media
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {recentUploads.map((upload) => {
                        const inGallery = galleryItems.some(
                          (it) => it.url === upload.secureUrl,
                        )
                        const isCover =
                          showMediaPicker === "cover" &&
                          form.immagine === upload.secureUrl
                        return (
                          <button
                            key={upload.id}
                            type="button"
                            onClick={() =>
                              showMediaPicker === "cover"
                                ? pickAsCover(upload)
                                : addToGallery(upload)
                            }
                            className={`relative aspect-square overflow-hidden border-2 transition-all group ${
                              isCover
                                ? "border-[#1B4332] ring-2 ring-[#1B4332]/40"
                                : inGallery
                                  ? "border-[#1B4332]/60 opacity-70"
                                  : "border-transparent hover:border-[#1B4332]"
                            }`}
                          >
                            <img
                              src={resolveImageUrl(
                                {
                                  src: upload.secureUrl,
                                  publicId: upload.publicId,
                                },
                                {
                                  width: 480,
                                  height: 480,
                                  objectFit: "cover",
                                },
                              )}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            {isCover && (
                              <div className="absolute inset-0 bg-[#1B4332]/70 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  ✓ Copertina attuale
                                </span>
                              </div>
                            )}
                            {!isCover && (
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-white text-[#1B4332] text-xs font-bold px-3 py-1.5 rounded shadow">
                                  {showMediaPicker === "cover"
                                    ? "Usa come copertina"
                                    : inGallery
                                      ? "Aggiungi ancora"
                                      : "＋ Aggiungi"}
                                </span>
                              </div>
                            )}
                            <div className="absolute bottom-1 left-1 right-1 flex justify-between items-end">
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                  upload.category === "project"
                                    ? "bg-[#1B4332]/80 text-white"
                                    : upload.category === "gallery"
                                      ? "bg-[#B5965A]/80 text-white"
                                      : upload.category === "sector"
                                        ? "bg-[#4A4A46]/80 text-white"
                                        : "bg-[#888580]/80 text-white"
                                }`}
                              >
                                {upload.category}
                              </span>
                              <span className="text-[10px] bg-white/90 px-1.5 py-0.5 rounded text-[#4A4A46]">
                                {upload.width}×{upload.height}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {showMediaPicker === "gallery" && galleryItems.length > 0 && (
                  <div className="border-t border-[#EAE7E0] px-5 py-3 bg-white flex items-center justify-between">
                    <span className="text-sm text-[#4A4A46]">
                      {galleryItems.length}{" "}
                      {galleryItems.length === 1
                        ? "immagine"
                        : "immagini"}{" "}
                      nella gallery ·{" "}
                      <span className="text-[#1B4332] font-medium">
                        {galleryItems.length > 1
                          ? "saranno mostrate come carosello ✓"
                          : "aggiungine almeno un'altra per il carosello"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(null)}
                      className="bg-[#1B4332] text-white text-sm px-4 py-2 hover:bg-[#143326] transition-colors"
                    >
                      Fatto ✓
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {statusMessage && (
        <div
          className={`mb-5 text-sm ${
            statusTone === "success" ? "text-[#1B4332]" : "text-amber-700"
          }`}
        >
          {statusMessage}
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-[#DDD9D0] bg-white px-4 py-2 text-sm text-[#4A4A46] focus:border-[#1B4332] focus:outline-none"
        >
          <option value="all">Tutti i settori</option>
          {SECTORS.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.label}
            </option>
          ))}
        </select>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="border border-[#DDD9D0] bg-white px-4 py-2 text-sm text-[#4A4A46] focus:border-[#1B4332] focus:outline-none"
        >
          <option value="all">Tutti gli stati</option>
          <option value="bozza">Bozza</option>
          <option value="in lavorazione">In lavorazione</option>
          <option value="completato">Completato</option>
        </select>

        <span className="self-center text-xs text-[#888580]">
          {filtered.length} risultati
        </span>
      </div>

      <div className="overflow-hidden border border-[#DDD9D0] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#DDD9D0] bg-[#F7F5F0] text-xs uppercase tracking-wide text-[#888580]">
              <th className="px-5 py-3 text-left">Progetto</th>
              <th className="hidden px-5 py-3 text-left md:table-cell">
                Settore
              </th>
              <th className="hidden px-5 py-3 text-left lg:table-cell">
                Cliente
              </th>
              <th className="hidden px-5 py-3 text-left sm:table-cell">Anno</th>
              <th className="px-5 py-3 text-left">Stato</th>
              <th className="px-5 py-3 text-left">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr
                key={project.id}
                draggable
                onDragStart={(e) => handleDragStart(e, project.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, project.id)}
                onDragEnd={handleDragEnd}
                className={`border-t border-[#EAE7E0] transition-colors hover:bg-[#F7F5F0] cursor-move ${
                  draggedId === project.id ? "opacity-50" : ""
                }`}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden bg-[#EAE7E0]">
                      <img
                        src={project.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-[#1A1A18]">
                        {project.title}
                      </span>
                      {project.featured && (
                        <span className="text-[11px] uppercase tracking-wide text-[#1B4332]">
                          In evidenza
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="hidden px-5 py-3 text-xs text-[#4A4A46] md:table-cell">
                  {project.sector}
                </td>
                <td className="hidden px-5 py-3 text-xs text-[#4A4A46] lg:table-cell">
                  {project.client || "—"}
                </td>
                <td className="hidden px-5 py-3 text-xs text-[#888580] sm:table-cell">
                  {project.year}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[project.status]}`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-3">
                    <Link
                      to={`/progetti/${project.id}`}
                      target="_blank"
                      className="text-xs text-[#888580] transition-colors hover:text-[#1B4332]"
                    >
                      Anteprima
                    </Link>
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-xs text-[#888580] transition-colors hover:text-[#1B4332]"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={isDeleting}
                      className="text-xs text-red-600 transition-colors hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {isDeleting ? <Loading size="sm" /> : "Elimina"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
