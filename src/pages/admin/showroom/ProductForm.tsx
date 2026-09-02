// pages/admin/showroom/ProductForm.tsx
// Form modale per Crea / Modifica Prodotto Showroom.
// - Validazione lato client (nome, categoria, prezzo base, SKU univoco)
// - Campo "Sconto %" opzionale che calcola in tempo reale `discountedPrice`
// - Upload immagini: drag & drop + selezione multipla + anteprima
//   (in ambiente mock, le immagini sono gestite come array di URL;
//    in produzione sostituire con upload vero su Cloudinary / CDN
//    chiamando lo stesso uploader di AdminMedia.tsx).
// - Stato attivo / inattivo toggle.

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { SHOWROOM_CATEGORIES, type Product, type Product as ProductT } from "../../../services/showroomApi"
import { useShowroomProducts } from "../../../services/showroomApi"

interface Props {
  /** Se presente = modalità modifica, altrimenti crea nuovo */
  initial?: ProductT
  onCancel: () => void
  onSave: (
    data: Omit<ProductT, "id" | "createdAt" | "updatedAt">,
    id?: string,
  ) => void | Promise<void>
  busy?: boolean
}

type FormState = {
  name: string
  description: string
  category: string
  basePrice: string
  discountedPrice: string
  scontoPercentuale: string
  images: string[]
  sku: string
  active: boolean
}

const emptyForm: FormState = {
  name: "",
  description: "",
  category: SHOWROOM_CATEGORIES[0],
  basePrice: "",
  discountedPrice: "",
  scontoPercentuale: "",
  images: [],
  sku: "",
  active: true,
}

type Errors = Partial<Record<keyof FormState, string>>

export default function ProductForm({ initial, onCancel, onSave, busy }: Props) {
  const allProducts = useShowroomProducts()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Errors>({})
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Se è in modalità modifica, carica i dati
  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        description: initial.description,
        category: initial.category,
        basePrice: String(initial.basePrice),
        discountedPrice: initial.discountedPrice
          ? String(initial.discountedPrice)
          : "",
        scontoPercentuale:
          initial.basePrice > 0 && initial.discountedPrice
            ? String(
                Math.round(
                  ((initial.basePrice - initial.discountedPrice) /
                    initial.basePrice) *
                    100,
                ),
              )
            : "",
        images: [...initial.images],
        sku: initial.sku,
        active: initial.active,
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [initial])

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value })),
    [],
  )

  // Auto-calcolo scontoPercentuale ↔ discountedPrice
  useEffect(() => {
    const base = Number(form.basePrice)
    if (isNaN(base) || base <= 0) return
    const sPct = Number(form.scontoPercentuale)
    if (!isNaN(sPct) && sPct >= 0 && sPct <= 100) {
      const discounted = Math.round(base * (1 - sPct / 100) * 100) / 100
      setForm((f) =>
        f.discountedPrice === String(discounted)
          ? f
          : { ...f, discountedPrice: String(discounted) },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.scontoPercentuale, form.basePrice])

  useEffect(() => {
    const base = Number(form.basePrice)
    const disc = Number(form.discountedPrice)
    if (
      isNaN(base) ||
      isNaN(disc) ||
      base <= 0 ||
      disc <= 0 ||
      disc >= base
    ) {
      return
    }
    const pct = Math.round(((base - disc) / base) * 100)
    setForm((f) =>
      f.scontoPercentuale === String(pct)
        ? f
        : { ...f, scontoPercentuale: String(pct) },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.discountedPrice])

  const livePreviewDiscounted = useMemo(() => {
    const base = Number(form.basePrice)
    const discPct = Number(form.scontoPercentuale)
    if (!isNaN(base) && !isNaN(discPct) && base > 0 && discPct > 0 && discPct <= 100) {
      return Math.round(base * (1 - discPct / 100) * 100) / 100
    }
    return null
  }, [form.basePrice, form.scontoPercentuale])

  // Validazione
  const validate = (): Errors => {
    const next: Errors = {}
    if (!form.name.trim()) next.name = "Inserisci il nome del prodotto"
    else if (form.name.trim().length < 3)
      next.name = "Il nome deve essere lungo almeno 3 caratteri"
    if (!form.category) next.category = "Seleziona una categoria"
    const baseP = Number(form.basePrice)
    if (!form.basePrice) next.basePrice = "Inserisci il prezzo base"
    else if (isNaN(baseP) || baseP <= 0)
      next.basePrice = "Il prezzo base deve essere maggiore di 0"
    if (form.discountedPrice) {
      const d = Number(form.discountedPrice)
      if (isNaN(d) || d <= 0)
        next.discountedPrice = "Il prezzo scontato non è valido"
      else if (d >= baseP)
        next.discountedPrice = "Deve essere inferiore al prezzo base"
    }
    if (!form.sku.trim()) next.sku = "Inserisci il codice SKU"
    else if (!/^[A-Za-z0-9\-_]{4,}$/.test(form.sku.trim()))
      next.sku = "SKU: solo lettere, numeri, -, _ (min 4 caratteri)"
    else {
      const duplicate = allProducts.find(
        (p) => p.sku === form.sku.trim() && p.id !== initial?.id,
      )
      if (duplicate) next.sku = "Questo SKU è già usato da un altro prodotto"
    }
    return next
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return
    const payload: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      basePrice: Number(form.basePrice),
      discountedPrice: form.discountedPrice
        ? Number(form.discountedPrice)
        : null,
      images: form.images,
      sku: form.sku.trim(),
      active: form.active,
    }
    await onSave(payload, initial?.id)
  }

  // ==== Immagini ====
  const addImagesFromFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (arr.length === 0) return
    const urls: string[] = []
    for (const f of arr) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onerror = () => reject(new Error("read fail"))
        r.onload = () => resolve(String(r.result))
        r.readAsDataURL(f)
      })
      urls.push(dataUrl)
    }
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
  }

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addImagesFromFiles(e.target.files)
    e.target.value = ""
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) addImagesFromFiles(e.dataTransfer.files)
  }

  const addPlaceholderImage = () => {
    const seed = Date.now().toString(36)
    setForm((f) => ({
      ...f,
      images: [
        ...f.images,
        `https://placehold.co/1200x800/EAE7E0/1A1A18?text=Immagine+${seed}`,
      ],
    }))
  }

  const removeImageAt = (idx: number) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== idx),
    }))
  }

  const moveImage = (from: number, to: number) => {
    setForm((f) => {
      const n = [...f.images]
      const [it] = n.splice(from, 1)
      n.splice(to, 0, it)
      return { ...f, images: n }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden border border-[#DDD9D0] shadow-2xl flex flex-col"
      >
        {/* Header modale */}
        <div className="px-6 py-4 border-b border-[#EAE7E0] flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-xl font-medium text-[#1A1A18]">
              {initial ? "Modifica prodotto" : "Nuovo prodotto"}
            </h2>
            <p className="text-xs text-[#888580] mt-0.5">
              {initial
                ? "Modifica i dati del prodotto e salva"
                : "Compila i campi e aggiungi le immagini del prodotto"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-[#888580] hover:text-[#1A1A18] transition-colors"
          >
            ✕ Chiudi
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Riga 1: nome / categoria */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <Field
              label="Nome prodotto *"
              error={errors.name}
              input={
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="es. Divano Chesterfield 3 posti in pelle"
                  className={inputClass(!!errors.name)}
                  autoFocus
                />
              }
            />
            <Field
              label="Categoria *"
              error={errors.category}
              input={
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={inputClass(!!errors.category)}
                >
                  {SHOWROOM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              }
            />
          </div>

          {/* Descrizione */}
          <Field
            label="Descrizione"
            input={
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Materiali, misure, note, dettagli costruttivi…"
                className={inputClass(false) + " resize-none"}
              />
            }
          />

          {/* Riga prezzi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="Prezzo base (€) *"
              error={errors.basePrice}
              input={
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.basePrice}
                  onChange={(e) => set("basePrice", e.target.value)}
                  placeholder="es. 3890"
                  className={inputClass(!!errors.basePrice)}
                />
              }
            />
            <Field
              label="Sconto % (opzionale)"
              hint="Inserisci una percentuale per calcolare in automatico il prezzo scontato"
              input={
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.scontoPercentuale}
                    onChange={(e) => set("scontoPercentuale", e.target.value)}
                    placeholder="es. 18"
                    className={inputClass(false)}
                  />
                  <span className="text-[#888580] text-sm">%</span>
                </div>
              }
            />
            <Field
              label="Prezzo scontato (€)"
              error={errors.discountedPrice}
              hint={
                livePreviewDiscounted
                  ? `Calcolato automaticamente: € ${livePreviewDiscounted.toLocaleString("it-IT")}`
                  : undefined
              }
              input={
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.discountedPrice}
                  onChange={(e) => set("discountedPrice", e.target.value)}
                  placeholder="es. 3190"
                  className={inputClass(!!errors.discountedPrice)}
                />
              }
            />
          </div>

          {/* Riga SKU + attivo */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
            <Field
              label="SKU (codice interno) *"
              error={errors.sku}
              hint="Codice univoco: lettere, numeri, - e _"
              input={
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  placeholder="es. FAR-SOG-001"
                  className={inputClass(!!errors.sku) + " font-mono"}
                />
              }
            />
            <label className="inline-flex items-center gap-2 px-3 py-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="w-4 h-4 accent-[#1B4332]"
              />
              <span className="text-sm font-medium text-[#4A4A46]">
                {form.active ? "✅ Attivo (visibile nel catalogo)" : "⏸ Inattivo (nascosto)"}
              </span>
            </label>
          </div>

          {/* Immagini */}
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div>
                <h3 className="block text-xs uppercase tracking-wide text-[#888580] mb-0.5">
                  Immagini prodotto
                </h3>
                <p className="text-xs text-[#888580]">
                  Trascina le foto nell&apos;area sottostante oppure clicca per
                  selezionarle. La prima immagine diventa la copertina.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[#1B4332] font-medium hover:underline"
                >
                  ＋ Seleziona da computer
                </button>
                <button
                  type="button"
                  onClick={addPlaceholderImage}
                  className="text-xs text-[#888580] hover:text-[#1B4332]"
                >
                  Aggiungi placeholder
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                />
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click()
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed p-4 transition-colors ${
                dragOver
                  ? "border-[#1B4332] bg-[#1B4332]/5"
                  : "border-[#DDD9D0] bg-[#F7F5F0] hover:border-[#1B4332]/50"
              }`}
            >
              {form.images.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-5xl text-[#DDD9D0] mb-3">🖼️</div>
                  <p className="text-[#4A4A46] text-sm mb-1">
                    Nessuna immagine ancora
                  </p>
                  <p className="text-xs text-[#888580]">
                    {dragOver
                      ? "Lascia qui i file…"
                      : "Clicca o trascina JPG / PNG / WebP qui (anche più di una)"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {form.images.map((url, i) => (
                    <div
                      key={url.slice(-40) + i}
                      draggable
                      onDragStart={() =>
                        (window as unknown as { __imgFromIdx?: number }).__imgFromIdx = i
                      }
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        const from = (window as unknown as { __imgFromIdx?: number }).__imgFromIdx
                        if (typeof from === "number" && from !== i) {
                          moveImage(from, i)
                        }
                      }}
                      className="relative aspect-[4/3] overflow-hidden border border-[#EAE7E0] bg-white group"
                    >
                      <img
                        src={url}
                        alt={`Immagine ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {i === 0 && (
                        <div className="absolute top-1 left-1 bg-[#1B4332] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                          Copertina
                        </div>
                      )}
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(i, 0)}
                            className="bg-white text-[#1B4332] text-[10px] px-1.5 py-0.5 rounded shadow"
                            title="Imposta come copertina"
                          >
                            ★ Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImageAt(i)}
                          className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-1 text-[10px] bg-black/55 text-white px-1.5 py-0.5 rounded">
                        {i + 1} / {form.images.length}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EAE7E0] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#888580]">
            I campi contrassegnati con <span className="text-[#C0392B]">*</span>{" "}
            sono obbligatori.
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="border border-[#DDD9D0] text-[#4A4A46] text-sm px-5 py-2.5 hover:bg-[#F7F5F0] transition-colors disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={busy}
              className="bg-[#1B4332] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#143326] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {busy ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvataggio…
                </>
              ) : initial ? (
                "Aggiorna prodotto"
              ) : (
                "Crea prodotto"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// ==========================
// Mini helper riutilizzabili
// ==========================

function inputClass(error: boolean) {
  return `w-full border ${
    error ? "border-red-400 focus:border-red-500" : "border-[#DDD9D0] focus:border-[#1B4332]"
  } bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:outline-none`
}

function Field({
  label,
  hint,
  error,
  input,
}: {
  label: string
  hint?: string
  error?: string
  input: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
        {label}
      </label>
      {input}
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[#888580] mt-1">{hint}</p>
      ) : null}
    </div>
  )
}
