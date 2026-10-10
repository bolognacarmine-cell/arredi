import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { SECTORS } from "../../data";
import {
  saveProjects,
  saveProjectsToProject,
  useProjectsDetailed,
  type ProjectRecord,
} from "../../projectStore";
import Loading from "../../components/Loading";
import { takePendingProjectImages } from "../../lib/mediaRecent";
import SectionImageUploader from "../../components/admin/SectionImageUploader";

const statusColor: Record<ProjectRecord["status"], string> = {
  "in lavorazione": "bg-amber-100 text-amber-700",
  completato: "bg-green-100 text-green-700",
  bozza: "bg-gray-100 text-gray-600",
};

type FormState = {
  titolo: string;
  settore: string;
  cliente: string;
  citta: string;
  anno: string;
  stato: ProjectRecord["status"];
  descrizione: string;
  evidenza: boolean;
  immagine: string;
  imageCloudinaryPublicId: string;
  materiali: string;
  tagText: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoSlug: string;
};

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
  seoMetaTitle: "",
  seoMetaDescription: "",
  seoSlug: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
    immagine:
      (project.coverImages && project.coverImages.length > 0
        ? project.coverImages[0]
        : project.image) || "",
    imageCloudinaryPublicId: project.imageCloudinaryPublicId ?? "",
    materiali: project.materials,
    tagText: (project.tags || []).join(", "),
    seoMetaTitle: project.seo?.metaTitle ?? "",
    seoMetaDescription: project.seo?.metaDescription ?? "",
    seoSlug: project.seo?.slug ?? "",
  };
}

function toProjectRecord(
  form: FormState,
  currentProjects: ProjectRecord[],
  editingId: string | null,
  coverImages: string[],
  galleryImages: string[],
): ProjectRecord {
  const selectedSector = SECTORS.find((sector) => sector.id === form.settore);
  const fallbackId = `${form.settore || "progetto"}-${slugify(form.titolo || "nuovo-progetto")}`;
  const nextId = editingId ?? fallbackId;
  const uniqueId = editingId
    ? editingId
    : currentProjects.some((project) => project.id === nextId)
      ? `${nextId}-${Date.now()}`
      : nextId;

  const imageCloudinaryPublicId = form.imageCloudinaryPublicId.trim() || undefined;

  const normalizedCoverImages =
    coverImages.length > 0 ? coverImages : form.immagine.trim() ? [form.immagine.trim()] : [];
  const normalizedGalleryImages = galleryImages.length > 0 ? galleryImages : normalizedCoverImages;

  const seoSlug = form.seoSlug.trim() || slugify(form.titolo || "");
  const seoMetaTitle = form.seoMetaTitle.trim() || form.titolo.trim();
  const seoMetaDescription =
    form.seoMetaDescription.trim() || form.descrizione.trim().substring(0, 160);

  return {
    id: uniqueId,
    title: form.titolo.trim(),
    sector: selectedSector?.label ?? "Settore da definire",
    sectorId: form.settore || selectedSector?.id || "generico", // Ensure sectorId is always provided
    location: form.citta.trim(),
    year: Number(form.anno) || new Date().getFullYear(),
    client: form.cliente.trim() || undefined,
    description: form.descrizione.trim() || "Descrizione non disponibile",
    image:
      form.immagine.trim() ||
      normalizedCoverImages[0] ||
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
    imageCloudinaryPublicId,
    coverImages: normalizedCoverImages,
    galleryImages: normalizedGalleryImages,
    tags: (form.tagText || "")
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
  };
}

export default function AdminProjects() {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, loadState, refresh } = useProjectsDetailed();
  const [filter, setFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [autoLoadedImagesCount, setAutoLoadedImagesCount] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const [coverImages, setCoverImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };
  const showError = (err: unknown, fallback: string) => {
    console.error(fallback, err);
    const msg = err instanceof Error ? err.message : fallback;
    setErrorToast(msg);
    window.setTimeout(() => setErrorToast(null), 6000);
  };

  useEffect(() => {
    const isNuovo = location.pathname === "/admin/progetti/nuovo";
    if (isNuovo) {
      const pending = takePendingProjectImages();
      const gallery = pending.gallery.length > 0 ? pending.gallery.map((g) => g.secureUrl) : [];
      const loadedCount = (pending.cover ? 1 : 0) + pending.gallery.length;
      setAutoLoadedImagesCount(loadedCount);
      setEditingId(null);
      setForm({
        ...emptyForm,
        immagine: pending.cover?.secureUrl ?? "",
        imageCloudinaryPublicId: pending.cover?.publicId ?? "",
      });
      setCoverImages(pending.cover ? [pending.cover.secureUrl] : []);
      setGalleryImages(gallery);
      setShowForm(true);
    } else if (routeId) {
      const existing = projects.find((project) => project.id === routeId);
      if (existing) {
        setEditingId(existing.id);
        setForm(projectToForm(existing));
        setCoverImages(existing.coverImages || []);
        setGalleryImages(existing.galleryImages || []);
        setShowForm(true);
      }
      setAutoLoadedImagesCount(0);
    } else {
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setCoverImages([]);
      setGalleryImages([]);
      setAutoLoadedImagesCount(0);
    }
  }, [location.pathname, routeId, projects]);

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const filtered = projects
    .filter((project) => filter === "all" || project.sectorId === filter)
    .filter((project) => stateFilter === "all" || project.status === stateFilter);

  const showSavedState = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = filtered.findIndex((p) => p.id === draggedId);
    const targetIndex = filtered.findIndex((p) => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newProjects = [...projects];
    const [draggedProject] = newProjects.splice(draggedIndex, 1);
    newProjects.splice(targetIndex, 0, draggedProject);

    saveProjects(newProjects);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
    if (routeId) {
      navigate("/admin/progetti", { replace: true });
    }
  };

  const persistProjects = async (
    nextProjects: ProjectRecord[],
    successMessage: string,
    fallbackMessage: string,
  ) => {
    try {
      await saveProjectsToProject(nextProjects);
      saveProjects(nextProjects);
      showToast(successMessage);
    } catch (error) {
      console.error("Error saving projects:", error);
      saveProjects(nextProjects);
      showError(error, `${fallbackMessage} (dati salvati solo nel browser)`);
    }

    showSavedState();
  };

  const handleSave = async () => {
    setIsSaving(true);
    const nextProject = toProjectRecord(form, projects, editingId, coverImages, galleryImages);
    const nextProjects = editingId
      ? projects.map((project) => (project.id === editingId ? nextProject : project))
      : [nextProject, ...projects];

    await persistProjects(
      nextProjects,
      editingId
        ? "Progetto aggiornato nel database e sincronizzato nel browser."
        : "Nuovo progetto salvato nel database e sincronizzato nel browser.",
      editingId
        ? "Modifica salvata solo nel browser corrente."
        : "Nuovo progetto salvato solo nel browser corrente.",
    );

    setIsSaving(false);
    closeForm();
  };

  const handleEdit = (project: ProjectRecord) => {
    if (!project.id) {
      console.error("Cannot edit project: missing id", project);
      return;
    }
    // Naviga verso la route di modifica: l'useEffect caricherà form,
    // coverImages e galleryImages dal progetto selezionato.
    navigate(`/admin/progetti/${project.id}`);
  };

  const handleDelete = async (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;
    if (!window.confirm(`Eliminare il progetto "${project.title}"?`)) return;

    setIsDeleting(true);
    const nextProjects = projects.filter((item) => item.id !== projectId);

    await persistProjects(
      nextProjects,
      "Progetto eliminato e archivio aggiornato nel database.",
      "Progetto eliminato solo nel browser corrente.",
    );
    setIsDeleting(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-light text-[#1A1A18]">Progetti</h1>
          <p className="mt-0.5 text-sm text-[#888580]">
            {projects.length} progetti totali
            {loadState.status === "ready" && loadState.source === "local" && (
              <span className="ml-2 text-amber-600">· dati locali (server non disponibile)</span>
            )}
            {loadState.status === "loading" && (
              <span className="ml-2 inline-flex items-center">
                <span className="w-3 h-3 border border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin ml-2 mr-1" />
                caricamento…
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={openCreateForm}
            className="bg-[#1B4332] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#143326] min-h-[44px]"
          >
            + Nuovo progetto
          </button>
        </div>
      </div>

      {loadState.status === "error" && (
        <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between flex-wrap gap-3">
          <div>
            <strong>❌ Errore nel caricamento dei progetti:</strong> {loadState.message}
            {projects.length === 0 && (
              <span className="block mt-1 text-red-600/80">
                Nessun progetto disponibile (neanche nel browser locale).
              </span>
            )}
          </div>
          <button
            onClick={() => refresh()}
            className="bg-[#1B4332] px-4 py-2 text-xs font-medium text-white hover:bg-[#143326] transition-colors"
          >
            Ricarica progetti
          </button>
        </div>
      )}

      {loadState.status === "ready" && projects.length === 0 && (
        <div className="mb-6 border border-[#DDD9D0] bg-[#F7F5F0] p-6 text-center text-sm text-[#888580]">
          <div className="text-3xl mb-2">📁</div>
          <div className="font-medium text-[#4A4A46] mb-1">Nessun progetto presente</div>
          <div>
            Clicca <strong>"+ Nuovo progetto"</strong> per iniziare.
          </div>
        </div>
      )}

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
                  &nbsp;pronte per l'uso
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
            {(
              [
                ["titolo", "Titolo"],
                ["cliente", "Cliente"],
                ["citta", "Città"],
                ["materiali", "Materiali"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                  {label}
                </label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none min-h-[44px]"
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-[#888580] mb-2">
                Copertina progetto – Carica una o più immagini
              </label>
              <SectionImageUploader
                value={coverImages}
                onChange={(urls) => {
                  setCoverImages(urls);
                  if (urls.length > 0) {
                    setForm((current) => ({
                      ...current,
                      immagine: urls[0],
                    }));
                  }
                }}
                multiple={true}
                maxFiles={5}
                maxSizeMB={10}
                category="project"
                onError={(msg) => alert(msg)}
              />
              {coverImages.length > 0 && (
                <div className="mt-2 text-xs text-[#888580]">
                  {coverImages.length} copertina{coverImages.length === 1 ? "" : "e"} caricata
                  {coverImages.length === 1 ? "" : "e"}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Settore
              </label>
              <select
                value={form.settore}
                onChange={(e) => set("settore", e.target.value)}
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none min-h-[44px]"
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
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Stato
              </label>
              <select
                value={form.stato}
                onChange={(e) => set("stato", e.target.value as ProjectRecord["status"])}
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none min-h-[44px]"
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
                className="w-full resize-none border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none min-h-[44px]"
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
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-[#888580] mb-2">
                Carosello dettaglio progetto – Carica una o più immagini
                {galleryImages.length > 0 && (
                  <span className="ml-2 text-[#1B4332] font-medium normal-case">
                    · {galleryImages.length} {galleryImages.length === 1 ? "immagine" : "immagini"}{" "}
                    · diventeranno un <strong>carosello</strong> nel dettaglio progetto
                  </span>
                )}
              </label>

              {/* SectionImageUploader for direct upload */}
              <SectionImageUploader
                value={galleryImages}
                onChange={(urls) => {
                  setGalleryImages(urls);
                }}
                multiple={true}
                maxFiles={12}
                maxSizeMB={10}
                category="gallery"
                onError={(msg) => alert(msg)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#4A4A46] mb-1.5">SEO</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#888580] mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={form.seoMetaTitle}
                    onChange={(e) => set("seoMetaTitle", e.target.value)}
                    placeholder="Titolo per SEO (es: The Craft Barbershop - Farcom)"
                    className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888580] mb-1">Slug</label>
                  <input
                    type="text"
                    value={form.seoSlug}
                    onChange={(e) => set("seoSlug", e.target.value)}
                    placeholder="URL slug (es: the-craft-barbershop)"
                    className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none min-h-[44px]"
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
                  className="w-full resize-none border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none min-h-[44px]"
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
                className="h-5 w-5 accent-[#1B4332] cursor-pointer"
              />
              <label htmlFor="evidenza" className="text-sm text-[#4A4A46] cursor-pointer py-2">
                Mostra in evidenza nella home
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#1B4332] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#143326] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[44px]"
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
              className="border border-[#DDD9D0] px-5 py-3 text-sm text-[#4A4A46] transition-colors hover:bg-[#EAE7E0] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <>
          <div className="mb-5 flex flex-wrap gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#4A4A46] focus:border-[#1B4332] focus:outline-none min-h-[44px] flex-1 min-w-[150px]"
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
              className="border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#4A4A46] focus:border-[#1B4332] focus:outline-none min-h-[44px] flex-1 min-w-[150px]"
            >
              <option value="all">Tutti gli stati</option>
              <option value="bozza">Bozza</option>
              <option value="in lavorazione">In lavorazione</option>
              <option value="completato">Completato</option>
            </select>

            <span className="self-center text-xs text-[#888580] py-3">{filtered.length} risultati</span>
          </div>

          <div className="overflow-hidden border border-[#DDD9D0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DDD9D0] bg-[#F7F5F0] text-xs uppercase tracking-wide text-[#888580]">
                  <th className="px-5 py-3 text-left">Progetto</th>
                  <th className="hidden px-5 py-3 text-left md:table-cell">Settore</th>
                  <th className="hidden px-5 py-3 text-left lg:table-cell">Cliente</th>
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
                    <td className="px-5 py-3" data-label="Progetto">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden bg-[#EAE7E0]">
                          <img src={project.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <span className="block font-medium text-[#1A1A18]">{project.title}</span>
                          {project.featured && (
                            <span className="text-[11px] uppercase tracking-wide text-[#1B4332]">
                              In evidenza
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td
                      className="hidden px-5 py-3 text-xs text-[#4A4A46] md:table-cell"
                      data-label="Settore"
                    >
                      {project.sector}
                    </td>
                    <td
                      className="hidden px-5 py-3 text-xs text-[#4A4A46] lg:table-cell"
                      data-label="Cliente"
                    >
                      {project.client || "—"}
                    </td>
                    <td
                      className="hidden px-5 py-3 text-xs text-[#888580] sm:table-cell"
                      data-label="Anno"
                    >
                      {project.year}
                    </td>
                    <td className="px-5 py-3" data-label="Stato">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[project.status]}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-5 py-3" data-label="Azioni">
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <Link
                          to={`/progetti/${project.id}`}
                          target="_blank"
                          className="text-xs text-[#888580] transition-colors hover:text-[#1B4332] py-2 px-2"
                        >
                          Anteprima
                        </Link>
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-xs text-[#888580] transition-colors hover:text-[#1B4332] py-2 px-2"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          disabled={isDeleting}
                          className="text-xs text-red-600 transition-colors hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 py-2 px-2"
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
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#1A1A18] text-white text-sm px-5 py-2.5 shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-md bg-red-700 text-white text-sm px-5 py-2.5 shadow-2xl animate-fade-in">
          {errorToast}
        </div>
      )}
    </div>
  );
}
