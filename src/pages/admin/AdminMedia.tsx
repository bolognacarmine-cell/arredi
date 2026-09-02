import { useEffect, useMemo, useRef, useState } from "react"
import { SECTORS } from "../../data"
import { useProjects } from "../../projectStore"
import {
  isCloudinaryConfigured,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  useCloudinaryUpload,
  type CloudinaryUploadResult,
} from "../../lib/cloudinary"
import {
  getPendingProjectImageIds,
  getRecentUploads,
  markPendingForNextNewProject,
  saveRecentUpload,
  saveRecentUploads,
  type RecentUpload,
  type UploadCategory,
} from "../../lib/mediaRecent"

const categoryConfig: Record<
  UploadCategory,
  { label: string; folder: string; desc: string }
> = {
  hero: {
    label: "Hero Home",
    folder: "farcom/hero",
    desc: "Immagine di sfondo della homepage (max 2560×1440)",
  },
  sector: {
    label: "Copertina Settore",
    folder: "farcom/settori",
    desc: "Hero pagina settore (max 2400×1600)",
  },
  project: {
    label: "Copertina Progetto",
    folder: "farcom/progetti",
    desc: "Card progetto nelle liste (max 1200×900)",
  },
  gallery: {
    label: "Gallery Progetto",
    folder: "farcom/progetti/gallery",
    desc: "Immagini galleria dettaglio progetto (max 2400×1350)",
  },
}

type AutoAssign = {
  enabled: boolean
  collection: "sector" | "project"
  id: string
  field: "hero" | "cover" | "gallery"
  index: number
}

export const NEW_PROJECT_ID = "__nuovo-progetto__"

function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* noop */
  }
  return false
}

function cleanTitleForPublicId(title: string): string | null {
  if (!title) return null
  const cleaned = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return cleaned || null
}

function describeTarget(
  a: AutoAssign,
  projects: Array<{ id: string; title: string }>,
): string {
  if (a.collection === "sector") {
    const s = SECTORS.find((s) => s.id === a.id)
    return `Settore "${s?.label ?? a.id}" → heroImageCloudinaryPublicId`
  }
  if (a.id === NEW_PROJECT_ID) {
    if (a.field === "gallery")
      return `⏳ Nuovo Progetto → galleryCloudinaryPublicIds[${a.index}] (si collega quando clicchi "+ Nuovo progetto")`
    return `⏳ Nuovo Progetto → imageCloudinaryPublicId (si collega quando clicchi "+ Nuovo progetto")`
  }
  const p = projects.find((p) => p.id === a.id)
  const base = `Progetto "${p?.title ?? a.id}" → `
  if (a.field === "cover") return base + "imageCloudinaryPublicId"
  if (a.field === "gallery") return base + `galleryCloudinaryPublicIds[${a.index}]`
  return base + "imageCloudinaryPublicId"
}

async function uploadToCloudinary(
  file: File,
  folder: string,
  publicIdTitle: string,
  onProgress: (p: number) => void,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
  formData.append("folder", folder)
  const pid = cleanTitleForPublicId(publicIdTitle)
  if (pid) formData.append("public_id", pid)

  // eslint-disable-next-line no-console
  console.group("☁️  Cloudinary Upload Request")
  // eslint-disable-next-line no-console
  console.log("Endpoint:", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`)
  // eslint-disable-next-line no-console
  console.log("upload_preset:", CLOUDINARY_UPLOAD_PRESET)
  // eslint-disable-next-line no-console
  console.log("folder:", folder)
  // eslint-disable-next-line no-console
  console.log("public_id:", pid || "(auto generato da Cloudinary)")
  // eslint-disable-next-line no-console
  console.log("file:", file.name, `${(file.size / 1024).toFixed(1)} KB`, file.type)
  // eslint-disable-next-line no-console
  console.groupEnd()

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      true,
    )

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          resolve(data)
        } catch {
          reject(new Error("Risposta Cloudinary non valida"))
        }
      } else {
        // Try to extract Cloudinary's internal error
        let cloudinaryError = ""
        let cloudinaryMessage = ""
        try {
          const parsed = JSON.parse(xhr.responseText)
          cloudinaryError = parsed?.error?.message || ""
          cloudinaryMessage = parsed?.message || ""
        } catch {
          cloudinaryMessage = xhr.responseText
        }
        const combinedErr =
          cloudinaryError || cloudinaryMessage || `HTTP ${xhr.status}`
        reject(new Error(`Upload fallito (status ${xhr.status}): ${combinedErr}`))
      }
    }
    xhr.onerror = () =>
      reject(new Error("Errore di rete durante l'upload su Cloudinary (controlla la connessione o le CORS)"))
    xhr.onabort = () => reject(new Error("Upload annullato"))

    xhr.send(formData)
  })
}

export default function AdminMedia() {
  const projects = useProjects()
  const allImages = projects.flatMap((p) =>
    p.gallery.map((url, i) => ({ url, project: p.title, id: `${p.id}-${i}` })),
  )
  const runningOnLocalhostDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".local"))
  const canWriteDataTsLocally = !!import.meta.env.DEV && runningOnLocalhostDev

  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState<UploadCategory>("project")
  const [title, setTitle] = useState("")
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "warn" | "err" } | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [busy, setBusy] = useState(false)
  const [apiBusy, setApiBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<CloudinaryUploadResult | null>(null)
  const [needsUploadClick, setNeedsUploadClick] = useState(false)
  const [autoAssign, setAutoAssign] = useState<AutoAssign>({
    enabled: canWriteDataTsLocally, // on Render / Prod, disattivato di default
    collection: "project",
    id: projects[0]?.id ?? "",
    field: "cover",
    index: 0,
  })
  const [apiResponse, setApiResponse] = useState<{
    ok: boolean
    message: string
    backupPath?: string | null
  } | null>(null)
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([])
  const [recentFilter, setRecentFilter] = useState<UploadCategory | "all">("all")

  const mainFileInputRef = useRef<HTMLInputElement | null>(null)
  const gridFileInputRef = useRef<HTMLInputElement | null>(null)
  const reminderTimerRef = useRef<number | null>(null)
  const bigBtnRef = useRef<HTMLButtonElement | null>(null)

  useCloudinaryUpload()

  const configured = isCloudinaryConfigured
  const presetOk = Boolean(CLOUDINARY_UPLOAD_PRESET)
  const everythingReady = file && configured && presetOk && !busy
  const [lastUploadIdRef, setLastUploadIdRef] = useState<string | null>(null)

  // Carica upload recenti all'avvio
  useEffect(() => {
    setRecentUploads(getRecentUploads())
  }, [])

  // Salva upload quando completato con successo
  useEffect(() => {
    if (lastResult && !error) {
      const uploadId = `${lastResult.public_id}-${Date.now()}`
      const newUpload: RecentUpload = {
        id: uploadId,
        publicId: lastResult.public_id,
        secureUrl: lastResult.secure_url,
        category,
        timestamp: Date.now(),
        width: lastResult.width,
        height: lastResult.height,
        titleHint: title.trim() || undefined,
        targetFieldHint:
          autoAssign.collection === "project" && autoAssign.field === "gallery"
            ? "gallery"
            : autoAssign.collection === "project"
              ? "cover"
              : undefined,
      }
      saveRecentUpload(newUpload)
      setRecentUploads(getRecentUploads())
      setLastUploadIdRef(uploadId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResult, error])
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.group("🖼️  Admin Cloudinary — stato env")
    // eslint-disable-next-line no-console
    console.log("VITE_CLOUDINARY_CLOUD_NAME =", CLOUDINARY_CLOUD_NAME)
    // eslint-disable-next-line no-console
    console.log("VITE_CLOUDINARY_UPLOAD_PRESET =", CLOUDINARY_UPLOAD_PRESET)
    // eslint-disable-next-line no-console
    console.log("configured =", configured, " / presetOk =", presetOk)
    // eslint-disable-next-line no-console
    console.groupEnd()
  }, [configured, presetOk])

  // Reminder: se file è selezionato da >2.5s e ancora non ha cliccato upload → avvisa
  useEffect(() => {
    if (reminderTimerRef.current) {
      window.clearTimeout(reminderTimerRef.current)
      reminderTimerRef.current = null
    }
    if (file && !busy && !lastResult && !error) {
      setNeedsUploadClick(true)
      reminderTimerRef.current = window.setTimeout(() => {
        showToast(
          "⚠ RICORDA: hai scelto il file ma NON hai cliccato 'AVVIA UPLOAD' — clicca il pulsante VERDE GIGANTE!",
          "warn",
          5200,
        )
        if (bigBtnRef.current) {
          bigBtnRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
          bigBtnRef.current.classList.add("animate-pulse")
          window.setTimeout(() => bigBtnRef.current?.classList.remove("animate-pulse"), 2200)
        }
      }, 2500)
    } else {
      setNeedsUploadClick(false)
    }
    return () => {
      if (reminderTimerRef.current) window.clearTimeout(reminderTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, busy, lastResult, error])

  const previewUrl = useMemo(() => {
    if (!file) return null
    try {
      return URL.createObjectURL(file)
    } catch {
      return null
    }
  }, [file])

  const showToast = (
    msg: string,
    kind: "ok" | "warn" | "err" = "ok",
    duration = 2600,
  ) => {
    setToast({ msg, kind })
    window.setTimeout(() => setToast(null), duration)
  }

  const reset = () => {
    setError(null)
    setLastResult(null)
    setProgress(0)
    setBusy(false)
    setApiResponse(null)
    setApiBusy(false)
  }

  // Synchronizza autoAssign se cambi category:
  // sector → collection=sector, field=hero (default)
  // project → collection=project, field=cover
  // gallery → collection=project, field=gallery
  // hero (home) → disattiva autoAssign per default (non c'è un target in SECTORS/PROJECTS per home hero)
  useEffect(() => {
    if (category === "sector") {
      setAutoAssign((prev) => ({
        ...prev,
        collection: "sector",
        field: "hero",
        id: prev.collection === "sector" ? prev.id : SECTORS[0]?.id ?? "",
        enabled: true,
      }))
    } else if (category === "project") {
      setAutoAssign((prev) => ({
        ...prev,
        collection: "project",
        field: "cover",
        id: prev.collection === "project" ? prev.id : projects[0]?.id ?? "",
        enabled: true,
      }))
    } else if (category === "gallery") {
      setAutoAssign((prev) => ({
        ...prev,
        collection: "project",
        field: "gallery",
        id: prev.collection === "project" ? prev.id : projects[0]?.id ?? "",
        enabled: true,
      }))
    } else {
      // Hero home: target non in data.ts, default off
      setAutoAssign((prev) => ({ ...prev, enabled: false }))
    }
  }, [category])

  const handleAssignToData = async (publicId: string, newUploadId: string) => {
    if (!autoAssign.enabled) return { ok: true, skipped: true as const }

    if (autoAssign.id === NEW_PROJECT_ID) {
      markPendingForNextNewProject([newUploadId])
      setApiResponse({
        ok: true,
        message:
          autoAssign.field === "gallery"
            ? "⏳ Pronta per il NUOVO PROGETTO: appena clicchi \"+ Nuovo progetto\" in Admin Progetti, questa foto finirà automaticamente nella GALLERY del nuovo progetto!"
            : "⏳ Pronta per il NUOVO PROGETTO: appena clicchi \"+ Nuovo progetto\" in Admin Progetti, questa foto diventerà la COPERTINA del nuovo progetto!",
      })
      return { ok: true, skipped: false as const }
    }

    if (!canWriteDataTsLocally) {
      setApiResponse({
        ok: false,
        message:
          "Ti trovi sul sito online (Produzione). La funzione 'Auto-assegna a data.ts' è disponibile SOLO in locale, quando apri il progetto con 'npm run dev' all'indirizzo localhost:8443. Qui puoi comunque caricare su Cloudinary, copiare il Public ID dal riquadro qui sotto, incollarlo manualmente in src/data.ts nel progetto e poi rifare il deploy su Render.",
      })
      return { ok: true, skipped: true as const }
    }

    setApiBusy(true)
    setApiResponse(null)
    try {
      const resp = await fetch("/api/assign-public-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: autoAssign.collection,
          id: autoAssign.id,
          field: autoAssign.field,
          index: autoAssign.field === "gallery" ? autoAssign.index : undefined,
          publicId,
        }),
      })
      const payload = (await resp.json().catch(() => ({}))) as
        | { ok: true; backupPath?: string | null }
        | { ok: false; error?: { message?: string; code?: string } }
      if (resp.ok && payload.ok) {
        setApiResponse({
          ok: true,
          message: `data.ts AGGIORNATO automaticamente! Campo scritto: ${
            autoAssign.collection === "sector" ? "SECTORS" : "PROJECTS"
          } → ${describeTarget(autoAssign, projects)}`,
          backupPath: (payload as { backupPath?: string | null }).backupPath ?? null,
        })
        return { ok: true, skipped: false as const }
      }
      const errMsg =
        (payload as { error?: { message?: string } }).error?.message ||
        `Risposta server non valida (${resp.status})`
      setApiResponse({ ok: false, message: errMsg })
      return { ok: false as const, error: new Error(errMsg), skipped: false as const }
    } catch (err) {
      const msg =
        err instanceof Error
          ? `${err.name}: ${err.message}`
          : "Errore sconosciuto durante aggiornamento data.ts"
      setApiResponse({ ok: false, message: msg })
      return { ok: false as const, error: err instanceof Error ? err : new Error(msg), skipped: false as const }
    } finally {
      setApiBusy(false)
    }
  }

  const handleFileFromMain = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.currentTarget.value = ""
    if (f) {
      reset()
      setFile(f)
      showToast("👌 File selezionato — adesso clicca 'AVVIA UPLOAD' qui sotto!", "warn", 3500)
    }
  }

  const openMainFilePicker = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = ""
      mainFileInputRef.current.click()
    }
  }

  const handleFileFromGrid = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.currentTarget.value = ""
    if (f) {
      reset()
      setFile(f)
      window.scrollTo({ top: 0, behavior: "smooth" })
      showToast("👌 File scelto — adesso clicca 'AVVIA UPLOAD' in alto!", "warn", 3800)
    }
  }

  const openGridFilePicker = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (gridFileInputRef.current) {
      gridFileInputRef.current.value = ""
      gridFileInputRef.current.click()
    }
  }

  const handleUploadClick = async () => {
    if (busy) return

    if (!file) {
      showToast("⚠ Scegli prima un file immagine cliccando l'area '+'", "warn")
      return
    }
    if (!configured) {
      showToast(
        "⚠ Cloud Name non letto! RIAVVIA npm run dev dopo aver modificato .env",
        "err",
        4500,
      )
      return
    }
    if (!presetOk) {
      showToast(
        "⚠ Upload Preset non letto! Crea preset UNSIGNED → modifica .env → RIAVVIA npm run dev",
        "err",
        4500,
      )
      return
    }

    reset()
    setBusy(true)
    setProgress(0)

    try {
      const folder = categoryConfig[category].folder
      const result = await uploadToCloudinary(
        file,
        folder,
        title || file.name,
        setProgress,
      )
      const uploadId = `${result.public_id}-${Date.now()}`
      const targetHint =
        autoAssign.collection === "project" && autoAssign.field === "gallery"
          ? "gallery"
          : autoAssign.collection === "project"
            ? "cover"
            : undefined
      const newUploadRec: RecentUpload = {
        id: uploadId,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        category,
        timestamp: Date.now(),
        width: result.width,
        height: result.height,
        titleHint: title.trim() || undefined,
        targetFieldHint: targetHint,
      }
      saveRecentUpload(newUploadRec)
      setRecentUploads(getRecentUploads())
      setLastResult(result)
      setFile(null)
      setTitle("")
      // — Se l'utente vuole auto-assegnare → aggiorna data.ts in automatico
      if (autoAssign.enabled) {
        const assign = await handleAssignToData(result.public_id, uploadId)
        if (assign.ok && !assign.skipped) {
          if (autoAssign.id === NEW_PROJECT_ID) {
            const what =
              autoAssign.field === "gallery" ? "GALLERY" : "COPERTINA"
            showToast(
              `✅ UPLOAD OK · Foto collegata al prossimo NUOVO PROGETTO (${what}) — vai su + Nuovo progetto per vederla!`,
              "ok",
              7000,
            )
          } else {
            showToast(
              "🎉 UPLOAD OK + AGGIORNATO IN data.ts! F5 per vedere la nuova foto",
              "ok",
              6000,
            )
          }
        } else if (assign.ok && assign.skipped) {
          showToast("✅ Upload completato! (Auto-assegna disattivato)", "ok", 4500)
        } else {
          showToast(
            "⚠ Upload OK ma data.ts NON aggiornato — vedi messaggio rosso qui sotto. Puoi comunque copiare il Public ID a mano.",
            "warn",
            5500,
          )
        }
      } else {
        showToast("✅ Upload completato! Copia il Public ID qui sotto", "ok", 4000)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore sconosciuto"
      setError(message)
      showToast("❌ Upload fallito — vedi il messaggio rosso qui sotto", "err", 4000)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-light text-[#1A1A18]">Libreria Media</h1>
          <p className="text-[#888580] text-sm mt-0.5">
            {allImages.length} file · Upload diretto su Cloudinary CDN
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              configured && presetOk
                ? "bg-[#1B4332]/10 text-[#1B4332]"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                configured && presetOk ? "bg-[#1B4332]" : "bg-red-500 animate-pulse"
              }`}
            />
            {configured && presetOk ? "Cloudinary connesso ✓" : "Configurazione incompleta"}
          </span>
        </div>
      </div>

      {/* BLOCCANTE: env non caricate */}
      {(!configured || !presetOk) && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-900 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none mt-0.5">🛑</span>
            <div className="flex-1 space-y-2">
              <p className="font-bold text-base text-red-900">
                Cloudinary NON è attualmente connesso.
              </p>
              <p className="text-red-800">
                Il tuo file .env ha i valori giusti, ma{" "}
                <strong>le variabili non sono state lette da Vite</strong>: modifichi
                .env senza riavviare il dev server.
              </p>
              <ol className="list-decimal list-inside space-y-1.5 bg-white border border-red-200 rounded-lg p-4 text-red-800">
                <li>
                  Vai sul terminale dove gira{" "}
                  <code className="font-mono bg-red-100 px-1.5 py-0.5 rounded">npm run dev</code>
                </li>
                <li>
                  Premi{" "}
                  <kbd className="px-2 py-0.5 border rounded bg-white font-mono text-[11px]">CTRL</kbd>{" "}
                  +{" "}
                  <kbd className="px-2 py-0.5 border rounded bg-white font-mono text-[11px]">C</kbd>{" "}
                  per spegnere
                </li>
                <li>
                  Riavvia con{" "}
                  <code className="font-mono bg-red-100 px-1.5 py-0.5 rounded">npm run dev</code>
                </li>
                <li>Ricarica la pagina Admin Media nel browser (F5)</li>
              </ol>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  className={`rounded-md p-3 ${configured ? "bg-green-50 border border-green-200 text-green-800" : "bg-white border border-red-200"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">{configured ? "✅" : "❌"}</span>
                    <div>
                      <p className="font-semibold">CLOUD_NAME</p>
                      <code className="text-[11px] font-mono bg-white border px-1.5 py-0.5 rounded block mt-1 w-fit">
                        {CLOUDINARY_CLOUD_NAME || "(non letto da Vite)"}
                      </code>
                    </div>
                  </div>
                </div>
                <div
                  className={`rounded-md p-3 ${presetOk ? "bg-green-50 border border-green-200 text-green-800" : "bg-white border border-red-200"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">{presetOk ? "✅" : "❌"}</span>
                    <div>
                      <p className="font-semibold">UPLOAD_PRESET</p>
                      <code className="text-[11px] font-mono bg-white border px-1.5 py-0.5 rounded block mt-1 w-fit">
                        {CLOUDINARY_UPLOAD_PRESET || "(non letto da Vite)"}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD CARD */}
      <div className="bg-white border border-[#DDD9D0] rounded-xl p-5 lg:p-6 space-y-5">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EAE7E0] flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl">⬆</span>
            <h2 className="font-display text-lg font-medium text-[#1A1A18]">
              Carica una nuova immagine
            </h2>
          </div>
          {needsUploadClick && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold animate-pulse shadow-md">
              <span>⚠</span> MANCA ANCORA IL CLICK FINALE!
            </div>
          )}
        </div>

        {/* STEP 1 banner */}
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50/60 p-5 space-y-2">
          <p className="font-bold text-amber-900 text-sm flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-base leading-none">
              1
            </span>
            STEP 1 — Seleziona un file immagine dal tuo computer
          </p>
          <p className="text-xs text-amber-800 ml-9">
            Nota: dopo aver scelto l&apos;immagine,{" "}
            <strong>devi ancora cliccare il pulsante VERDE dello Step 2</strong>.
          </p>
        </div>

        {/* Content: STEP + PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 🔵 COLONNA SINISTRA: form fields */}
          <div className="space-y-5">
            {/* ① File input picker */}
            <div>
              <label className="block text-xs font-semibold tracking-wide uppercase text-[#888580] mb-2">
                File immagine
              </label>
              <div
                role="button"
                tabIndex={0}
                onClick={openMainFilePicker}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openMainFilePicker(e)
                }}
                className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none focus:outline-none focus:ring-4 focus:ring-[#1B4332]/20 ${
                  file
                    ? "border-[#1B4332] bg-[#1B4332]/[0.04] shadow-inner shadow-[#1B4332]/10"
                    : "border-[#DDD9D0] hover:border-[#1B4332] hover:bg-[#1B4332]/[0.02] hover:scale-[1.01]"
                }`}
              >
                {file ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#1B4332] text-white flex items-center justify-center">
                      <span className="text-3xl leading-none">✓</span>
                    </div>
                    <p className="text-lg font-bold text-[#1B4332] truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-[#1B4332]/80">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · clicca per sostituire
                    </p>
                    <p className="text-xs font-bold text-amber-700 bg-amber-100 inline-block px-3 py-1 rounded-full mt-1">
                      👆 Step 1 COMPLETATO
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <span className="text-6xl text-[#DDD9D0] block leading-none">＋</span>
                    <p className="text-lg font-bold text-[#4A4A46]">
                      Clicca QUI dentro per aprire i file
                    </p>
                    <p className="text-xs text-[#888580]">JPG, PNG, WebP · max consigliato ~5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={mainFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileFromMain}
              />
            </div>

            {/* ② Category */}
            <div>
              <label className="block text-xs font-semibold tracking-wide uppercase text-[#888580] mb-2">
                Tipo / Destinazione
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as UploadCategory)}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#DDD9D0] text-sm text-[#1A1A18] focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20"
              >
                {(Object.keys(categoryConfig) as UploadCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {categoryConfig[k].label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#888580] mt-1.5">
                Cartella CDN:{" "}
                <span className="font-mono bg-[#F7F5F0] px-1.5 py-0.5 rounded">
                  {categoryConfig[category].folder}
                </span>{" "}
                · {categoryConfig[category].desc}
              </p>
            </div>

            {/* ③ Title (opzionale) */}
            <div>
              <label className="block text-xs font-semibold tracking-wide uppercase text-[#888580] mb-2">
                Titolo / nome file (opzionale)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="es. craft-barbershop-cover"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#DDD9D0] text-sm text-[#1A1A18] placeholder:text-[#888580]/60 focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20"
              />
              <p className="text-xs text-[#888580] mt-1.5">
                Se compilato, diventa il nome del file su Cloudinary (ripulito automaticamente).
              </p>
            </div>

            {/* ④ Auto-assegna a data.ts (OPZIONE B) — SOLO IN LOCALE! */}
            <div
              className={
                "rounded-xl border p-4 space-y-3 " +
                (canWriteDataTsLocally
                  ? "border-[#1B4332]/30 bg-[#1B4332]/[0.04]"
                  : "border-amber-400 bg-amber-50")
              }
            >
              {!canWriteDataTsLocally && (
                <div className="rounded-md bg-amber-100 border border-amber-300 p-3 space-y-1.5">
                  <p className="font-bold text-amber-900 text-sm flex items-center gap-2">
                    <span className="text-lg">⚠️</span> Modalità Produzione (sito online)
                  </p>
                  <p className="text-[12px] text-amber-900 leading-snug">
                    Stai visualizzando il pannello su <strong>arredi.onrender.com</strong>. Qui la funzione
                    «Auto-assegna a data.ts» <strong>NON è disponibile</strong>, perché su Render il sito è
                    composto da <strong>file statici</strong> (non c&apos;è nessun programma in grado di
                    modificare <code>src/data.ts</code> dopo il deploy).
                  </p>
                  <p className="text-[12px] text-amber-900 leading-snug">
                    ✅ <strong>Cosa puoi comunque fare QUI sul sito online:</strong> caricare le foto su
                    Cloudinary, copiare il Public ID dal riquadro verde, poi incollarlo manualmente in{" "}
                    <code>data.ts</code> quando aprirai il progetto sul computer, e infine rifare il deploy
                    su Render.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3">
                <label
                  className={
                    "inline-flex items-start gap-2 cursor-pointer select-none flex-1 " +
                    (!canWriteDataTsLocally ? "opacity-70 pointer-events-none" : "")
                  }
                >
                  <input
                    type="checkbox"
                    checked={autoAssign.enabled}
                    onChange={(e) =>
                      setAutoAssign((prev) => ({ ...prev, enabled: e.target.checked }))
                    }
                    disabled={!canWriteDataTsLocally}
                    className="mt-0.5 w-4 h-4 rounded border-[#1B4332]/60 text-[#1B4332] focus:ring-[#1B4332]/30 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-sm text-[#1A1A18] block">
                      🎯 Auto-assegna a data.ts — {canWriteDataTsLocally ? "NIENTE COPIA-INCOLLA!" : " (solo in locale)"}
                    </span>
                    <span className="text-[12px] text-[#5a5854] mt-0.5 block">
                      {canWriteDataTsLocally
                        ? "Appena finisce l'upload, scrive automaticamente il Public ID nel punto giusto di data.ts. F5 e la foto nuova è già visibile nel sito!"
                        : "Per usare questa funzione, apri il progetto in locale con npm run dev e collegati a http://localhost:8443/admin/media"}
                    </span>
                  </div>
                </label>
              </div>

              {autoAssign.enabled && canWriteDataTsLocally && (
                <div className="ml-6 space-y-3 pt-2 border-t border-[#1B4332]/10">
                  {/* Collection picker: Settore o Progetto */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5a5854] mb-1.5">
                        1. Dove vuoi metterla?
                      </label>
                      <select
                        value={autoAssign.collection}
                        onChange={(e) => {
                          const coll = e.target.value as "sector" | "project"
                          setAutoAssign((prev) => ({
                            ...prev,
                            collection: coll,
                            id:
                              coll === "sector"
                                ? SECTORS[0]?.id ?? ""
                                : projects[0]?.id ?? "",
                            field: coll === "sector" ? "hero" : "cover",
                            index: 0,
                          }))
                        }}
                        className="w-full px-3 py-2 rounded-md bg-white border border-[#DDD9D0] text-sm focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20"
                      >
                        <option value="sector">🏢 Settore (Hero)</option>
                        <option value="project">🏗️ Progetto (Copertina o Galleria)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5a5854] mb-1.5">
                        2. Quale?
                      </label>
                      <select
                        value={autoAssign.id}
                        onChange={(e) =>
                          setAutoAssign((prev) => ({ ...prev, id: e.target.value, index: 0 }))
                        }
                        className="w-full px-3 py-2 rounded-md bg-white border border-[#DDD9D0] text-sm focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20"
                      >
                        {autoAssign.collection === "project" ? (
                          <>
                            <option value={NEW_PROJECT_ID}>✨ ⏳ Nuovo Progetto (in arrivo)</option>
                            {projects.map((project) => (
                              <option key={project.id} value={project.id}>
                                {project.title}
                              </option>
                            ))}
                          </>
                        ) : (
                          SECTORS.map((sector) => (
                            <option key={sector.id} value={sector.id}>
                              {sector.label}
                            </option>
                          ))
                        )}
                      </select>
                      {autoAssign.collection === "project" &&
                        autoAssign.id === NEW_PROJECT_ID &&
                        getPendingProjectImageIds().length > 0 && (
                          <p className="mt-1.5 text-[11px] text-[#1B4332] font-medium">
                            ⏳ {getPendingProjectImageIds().length} foto in attesa per il nuovo progetto
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Campo: cover/hero vs gallery + index */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5a5854] mb-1.5">
                        3. In che campo?
                      </label>
                      <select
                        value={autoAssign.field}
                        onChange={(e) =>
                          setAutoAssign((prev) => ({
                            ...prev,
                            field: e.target.value as AutoAssign["field"],
                            index: 0,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-md bg-white border border-[#DDD9D0] text-sm focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20"
                      >
                        {autoAssign.collection === "sector" ? (
                          <option value="hero">🖼️ Hero immagine (heroImageCloudinaryPublicId)</option>
                        ) : (
                          <>
                            <option value="cover">📸 Copertina (imageCloudinaryPublicId)</option>
                            <option value="gallery">🎞️ Galleria (galleryCloudinaryPublicIds[])</option>
                          </>
                        )}
                      </select>
                    </div>

                    {autoAssign.collection === "project" && autoAssign.field === "gallery" ? (
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5a5854] mb-1.5">
                          4. Posizione nella galleria (0=prima foto)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={autoAssign.index}
                          onChange={(e) =>
                            setAutoAssign((prev) => ({
                              ...prev,
                              index: Math.max(0, Math.min(20, Number(e.target.value) || 0)),
                            }))
                          }
                          className="w-full px-3 py-2 rounded-md bg-white border border-[#DDD9D0] text-sm focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20"
                        />
                      </div>
                    ) : (
                      <div className="flex items-end">
                        <div className="w-full rounded-md bg-[#F7F5F0] border border-[#EAE7E0] p-2.5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-[#5a5854]">
                            Anteprima destinazione
                          </p>
                          <p className="text-[12px] text-[#1A1A18] mt-0.5 font-medium truncate">
                            {describeTarget(autoAssign, projects)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-md bg-white border border-[#1B4332]/20 p-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#5a5854]">
                      ✓ Destinazione finale
                    </p>
                    <p className="text-[12px] text-[#1A1A18] mt-0.5 font-medium break-words">
                      {describeTarget(autoAssign, projects)}
                    </p>
                    <p className="text-[11px] text-[#5a5854] mt-0.5">
                      (Nota: viene creato un backup <code>data.ts.backup-*.ts</code> prima di
                      ogni modifica — sempre sicuro!)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 🔴 STEP 2 GIGANTE */}
            <div className="rounded-xl border-2 border-green-400 bg-green-50/60 p-5 space-y-3 shadow-md shadow-green-100">
              <p className="font-bold text-green-900 text-sm flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-black text-base leading-none">
                  2
                </span>
                STEP 2 — Conferma e avvia l&apos;upload VERO
              </p>
              <p className="text-xs text-green-800 ml-9">
                🚨 <strong>Senza questo click, il file NON arriva su Cloudinary!</strong>
              </p>
              <button
                ref={bigBtnRef}
                type="button"
                onClick={handleUploadClick}
                disabled={busy}
                className={`w-full inline-flex items-center justify-center gap-2.5 text-white font-black text-lg px-7 py-5 rounded-xl transition-all shadow-xl disabled:shadow-none ${
                  busy
                    ? "bg-[#888580] cursor-wait"
                    : everythingReady
                      ? "bg-gradient-to-r from-[#1B4332] via-[#20553c] to-[#1B4332] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
                      : needsUploadClick
                        ? "bg-gradient-to-r from-[#E69138] via-[#F0A050] to-[#E69138] hover:shadow-2xl hover:-translate-y-0.5 animate-pulse"
                        : "bg-gradient-to-r from-[#E69138] via-[#F0A050] to-[#E69138] hover:shadow-2xl hover:-translate-y-0.5"
                }`}
              >
                {busy ? (
                  <>
                    <span className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                    UPLOAD IN CORSO… {progress}%
                  </>
                ) : everythingReady ? (
                  <>🚀 AVVIA UPLOAD — MANDA ORA SU CLOUDINARY!</>
                ) : needsUploadClick ? (
                  <>👉 CLICCA QUI ORA PER CARICARE — È L'ULTIMO PASSO!</>
                ) : (
                  <>👉 CLICCA QUI POI DOPO AVER SCELTO IL FILE (Step 1)</>
                )}
              </button>
              {(lastResult || error) && (
                <button
                  type="button"
                  onClick={reset}
                  className="w-full mt-1 inline-flex items-center justify-center px-5 py-3 rounded-lg text-sm border border-[#DDD9D0] text-[#4A4A46] hover:bg-[#F7F5F0] transition-colors"
                >
                  Azzera risultati
                </button>
              )}
            </div>
          </div>

          {/* 🟢 COLONNA DESTRA: preview + stato + risultato */}
          <div className="space-y-4">
            <div>
              <p className="block text-xs font-semibold tracking-wide uppercase text-[#888580] mb-2">
                Anteprima
              </p>
              <div className="aspect-video rounded-lg overflow-hidden bg-[#EAE7E0] border border-[#DDD9D0] flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Anteprima file selezionato"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-[#888580] text-sm text-center px-4">
                    👈 Nessun file selezionato
                    <br />
                    <span className="text-xs">(clicca l&apos;area &quot;＋&quot; a sinistra)</span>
                  </div>
                )}
              </div>
            </div>

            {busy && (
              <div className="rounded-lg border border-[#1B4332]/30 bg-[#1B4332]/5 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1B4332]">🚀 Upload in corso… non chiudere la pagina</span>
                  <span className="text-[#1B4332] tabular-nums text-base">{progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-[#EAE7E0] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1B4332] to-[#E69138] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 space-y-3">
                <p className="font-bold mb-1.5 flex items-center gap-2">
                  <span className="text-lg">❌</span> Errore upload — Cloudinary dice:
                </p>
                <p className="text-red-800 break-words bg-white border border-red-200 rounded-md p-3 font-mono text-xs">
                  {error}
                </p>

                {/400|upload_preset|Invalid|preset|Signing Mode/.test(error) && (
                  <div className="rounded-lg border border-red-300 bg-white p-4 space-y-3">
                    <p className="font-semibold text-red-900 flex items-center gap-2">
                      <span>🔧</span> CAUSA POSSIBILE: Upload Preset ERRATO o SIGNED invece di UNSIGNED
                    </p>
                    <div className="text-[13px] text-red-800 space-y-2">
                      <p>Stai usando il preset:</p>
                      <code className="block font-mono text-xs bg-red-50 border border-red-200 px-3 py-2 rounded whitespace-nowrap overflow-x-auto">
                        {CLOUDINARY_UPLOAD_PRESET}
                      </code>
                      <p className="font-semibold mt-2">
                        Controlla sul dashboard Cloudinary — dev'essere:
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 bg-red-50 rounded-md p-3 border border-red-200">
                        <li>
                          Vai su{" "}
                          <a
                            href={`https://console.cloudinary.com/pm/c-${CLOUDINARY_CLOUD_NAME}/settings/upload`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline font-bold"
                          >
                            Cloudinary → Settings → Upload → Upload Presets
                          </a>
                        </li>
                        <li>
                          Apri il preset{" "}
                          <code className="font-mono bg-white px-1.5 py-0.5 rounded border">
                            {CLOUDINARY_UPLOAD_PRESET}
                          </code>
                        </li>
                        <li>
                          <span className="font-bold text-red-900">
                            Signing Mode → DEVE essere: Unsigned
                          </span>{" "}
                          (se è Signed → 400 Bad Request!)
                        </li>
                        <li>
                          Se il preset NON ESISTE affatto: <span className="font-bold">clicca 'Add upload preset'</span>, nome: <code className="font-mono bg-white px-1 py-0.5 rounded">{CLOUDINARY_UPLOAD_PRESET}</code>, Signing Mode: Unsigned, Save.
                        </li>
                      </ol>
                      <p className="mt-2 text-red-700">
                        Dopo ogni modifica, clicca → Salva preset → torna qui →
                        RIPROVA.
                      </p>
                    </div>
                  </div>
                )}

                {/CORS|rete|connection|network/i.test(error) && (
                  <p className="text-red-700 text-xs">
                    ⚠ Errore di rete / CORS. Verifica la connessione internet. Cloudinary
                    consente chiamate CORS da localhost.
                  </p>
                )}
              </div>
            )}

            {!busy && !error && lastResult && (
              <div className="rounded-lg border-2 border-green-400 bg-green-50 p-4 space-y-3 shadow-lg shadow-green-100">
                <p className="text-sm font-bold text-green-900 flex items-center gap-2">
                  <span className="text-xl">✅</span> Upload completato!
                </p>
                {/* API response: successo auto-assegna */}
                {apiResponse?.ok && (
                  <div className="rounded-lg border-2 border-[#1B4332]/30 bg-white p-4 space-y-2">
                    <p className="font-bold text-[#1B4332] text-base flex items-center gap-2">
                      <span className="text-xl">🪄</span> Public ID scritto AUTOMATICAMENTE in data.ts!
                    </p>
                    <p className="text-[13px] text-[#333]">
                      {apiResponse.message}
                    </p>
                    {apiResponse.backupPath && (
                      <p className="text-[11px] text-[#555] font-mono break-all bg-[#F7F5F0] border rounded-md px-2.5 py-1.5 mt-1">
                        🔒 Backup creato: {apiResponse.backupPath}
                      </p>
                    )}
                    <div className="rounded-md bg-[#1B4332]/10 border border-[#1B4332]/20 p-2.5 mt-1">
                      <p className="text-[12px] text-[#1B4332] font-semibold">
                        🚀 Adesso vai nel browser e premi F5 (o Ricarica) in una qualunque pagina del sito —
                        la foto nuova è VISIBILE SUBITO!
                      </p>
                    </div>
                  </div>
                )}
                {apiResponse && !apiResponse.ok && (
                  <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4 space-y-2">
                    <p className="font-bold text-amber-900 text-base flex items-center gap-2">
                      <span className="text-xl">⚠️</span> Upload OK ma scrittura su data.ts fallita
                    </p>
                    <p className="text-[13px] text-amber-900 break-words font-mono bg-white border border-amber-200 rounded-md px-3 py-2">
                      {apiResponse.message}
                    </p>
                    <p className="text-[12px] text-amber-800">
                      Puoi comunque copiare il Public ID a mano qui sotto.
                    </p>
                  </div>
                )}
                {apiBusy && (
                  <div className="rounded-lg border-2 border-[#1B4332]/40 bg-[#1B4332]/5 p-3 flex items-center gap-2 text-[#1B4332] text-sm font-medium">
                    <span className="w-4 h-4 border-2 border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin" />
                    Scrivendo su data.ts in corso…
                  </div>
                )}
                <div className="space-y-2.5 pt-2 border-t border-green-200/60">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-green-800">
                        ① Public ID → incollalo in{" "}
                        <code className="lowercase">*CloudinaryPublicId</code> in data.ts
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const ok = copyToClipboard(lastResult.public_id)
                          showToast(
                            ok ? "📋 Public ID COPIATO!" : "Copia fallita",
                            ok ? "ok" : "err",
                          )
                        }}
                        className="text-[11px] font-bold px-3 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        📋 COPIA
                      </button>
                    </div>
                    <div className="rounded-md border border-green-300 bg-white px-3 py-2.5 break-all font-mono text-xs text-green-900 select-all">
                      {lastResult.public_id}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-green-800">
                        ② Secure URL (link CDN diretto)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const ok = copyToClipboard(lastResult.secure_url)
                          showToast(ok ? "📋 URL CDN copiato!" : "Copia fallita", ok ? "ok" : "err")
                        }}
                        className="text-[11px] font-bold px-3 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        📋 COPIA
                      </button>
                    </div>
                    <div className="rounded-md border border-green-300 bg-white px-3 py-2.5 break-all font-mono text-xs text-green-900 select-all">
                      {lastResult.secure_url}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="rounded-md bg-white border border-green-200 p-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-green-700 font-bold">DIM.</p>
                      <p className="font-mono text-sm text-green-900 mt-0.5">
                        {lastResult.width}×{lastResult.height}
                      </p>
                    </div>
                    <div className="rounded-md bg-white border border-green-200 p-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-green-700 font-bold">FORMATO</p>
                      <p className="font-mono text-sm uppercase text-green-900 mt-0.5">
                        {lastResult.format}
                      </p>
                    </div>
                    <div className="rounded-md bg-white border border-green-200 p-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-green-700 font-bold">PESO</p>
                      <p className="font-mono text-sm text-green-900 mt-0.5">
                        {lastResult.bytes < 1024 * 1024
                          ? `${(lastResult.bytes / 1024).toFixed(1)} KB`
                          : `${(lastResult.bytes / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GALLERY ESISTENTI */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-medium text-[#1A1A18]">
            Upload recenti
          </h2>
          <div className="flex gap-2">
            {(["all", "hero", "sector", "project", "gallery"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setRecentFilter(cat)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  recentFilter === cat
                    ? "bg-[#1B4332] text-white"
                    : "bg-white border border-[#DDD9D0] text-[#4A4A46] hover:border-[#1B4332]"
                }`}
              >
                {cat === "all" ? "Tutti" : categoryConfig[cat as UploadCategory].label}
              </button>
            ))}
            {recentUploads.length > 0 && (
              <button
                onClick={() => {
                  clearRecentUploads()
                  setRecentUploads([])
                }}
                className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                Pulisci
              </button>
            )}
          </div>
        </div>
        
        {recentUploads.length === 0 ? (
          <div className="bg-[#F7F5F0] border border-[#DDD9D0] rounded-lg p-8 text-center text-[#888580]">
            <p className="text-sm">Nessun upload recente</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {recentUploads
              .filter((u) => recentFilter === "all" || u.category === recentFilter)
              .map((upload) => (
                <div
                  key={upload.id}
                  className="group relative bg-[#EAE7E0] aspect-square overflow-hidden border border-[#DDD9D0] hover:border-[#1B4332] transition-colors"
                >
                  <img
                    src={upload.secureUrl}
                    alt={upload.publicId}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-2">
                    <div className="w-full">
                      <p className="text-white text-xs font-medium truncate">
                        {categoryConfig[upload.category].label}
                      </p>
                      <p className="text-white/80 text-[10px] truncate">
                        {upload.width}×{upload.height}
                      </p>
                      <button
                        onClick={() => {
                          const ok = copyToClipboard(upload.secureUrl)
                          showToast(ok ? "📋 URL copiato!" : "Copia fallita", ok ? "ok" : "err")
                        }}
                        className="mt-1 w-full text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-colors"
                      >
                        Copia URL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ULTIMI PROGETTI */}
      <div>
        <h2 className="font-display text-lg font-medium text-[#1A1A18] mb-4">
          Ultimi progetti (anteprima)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {allImages.map((img) => (
            <div
              key={img.id}
              className="group relative bg-[#EAE7E0] aspect-square overflow-hidden border border-[#DDD9D0] hover:border-[#1B4332] transition-colors cursor-pointer"
            >
              <img
                src={img.url.replace("w=1200", "w=400").replace("h=800", "h=400")}
                alt={img.project}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                <div className="p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-xs font-medium truncate">{img.project}</p>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={openGridFilePicker}
            className="border-2 border-dashed border-[#DDD9D0] aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-[#1B4332] transition-colors bg-white focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20 select-none group"
          >
            <span className="text-5xl text-[#DDD9D0] mb-1 group-hover:text-[#1B4332] transition-colors">
              ＋
            </span>
            <span className="text-xs font-semibold text-[#888580] group-hover:text-[#1B4332] transition-colors">
              Carica
            </span>
            <input
              ref={gridFileInputRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*"
              onChange={handleFileFromGrid}
            />
          </button>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl max-w-sm animate-[fadeIn_.2s_ease-out] ${
            toast.kind === "ok"
              ? "bg-[#1B4332]"
              : toast.kind === "err"
                ? "bg-red-600"
                : "bg-[#E69138]"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}
