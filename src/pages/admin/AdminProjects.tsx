import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
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

  useEffect(() => {
    if (routeId === "nuovo") {
      setEditingId(null)
      setForm(emptyForm)
      setShowForm(true)
    } else if (routeId) {
      const existing = projects.find((project) => project.id === routeId)
      if (existing) {
        setEditingId(existing.id)
        setForm(projectToForm(existing))
        setShowForm(true)
      }
    }
  }, [routeId, projects])

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }))

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
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-medium text-[#1A1A18]">
              {editingId ? "Modifica progetto" : "Nuovo progetto"}
            </h2>
            <button
              onClick={closeForm}
              className="text-sm text-[#888580] transition-colors hover:text-[#1A1A18]"
            >
              ✕ Chiudi
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {([
              ["titolo", "Titolo"],
              ["cliente", "Cliente"],
              ["citta", "Citta"],
              ["immagine", "Immagine copertina"],
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
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Gallery URL, una per riga
              </label>
              <textarea
                rows={4}
                value={form.galleryText}
                onChange={(e) => set("galleryText", e.target.value)}
                className="w-full resize-none border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Cloudinary Public ID · Copertina
              </label>
              <input
                type="text"
                value={form.imageCloudinaryPublicId}
                onChange={(e) => set("imageCloudinaryPublicId", e.target.value)}
                placeholder="es. farcom/progetti/barber-cover"
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Cloudinary Public ID · Gallery (uno per riga, stesso ordine delle URL sopra)
              </label>
              <textarea
                rows={4}
                value={form.galleryCloudinaryPublicIdsText}
                onChange={(e) => set("galleryCloudinaryPublicIdsText", e.target.value)}
                placeholder="es. farcom/progetti/gallery-1&#10;farcom/progetti/gallery-2"
                className="w-full resize-none border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none font-mono"
              />
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
