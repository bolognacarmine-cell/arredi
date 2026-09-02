// Form modale crea/modifica prodotto showroom
import { useEffect, useMemo, useState, type ChangeEvent, type DragEvent } from "react"
import CategorySelect from "../../../components/admin/showroom/CategorySelect"
import FurnitureTypeSelect from "../../../components/admin/showroom/FurnitureTypeSelect"
import type { Product } from "../../../types/showroom"
import { useProducts } from "../../../services/showroomApi"

interface Props {
  initial?: Product
  onCancel: () => void
  onSave: (
    data: Omit<Product, "id" | "createdAt" | "updatedAt" | "slug"> & { slug?: string },
    id?: string,
  ) => Promise<void> | void
  busy?: boolean
}

type FS = {
  name: string
  description: string
  activityCategory: string
  furnitureType: string
  basePrice: string
  discountPct: string
  images: string[]
  sku: string
  active: boolean
}
const empty: FS = {
  name: "",
  description: "",
  activityCategory: "Barberie",
  furnitureType: "Banconi reception",
  basePrice: "",
  discountPct: "",
  images: [],
  sku: "",
  active: true,
}

export default function ProductForm({ initial, onCancel, onSave, busy }: Props) {
  const all = useProducts()
  const [form, setForm] = useState<FS>(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const dragIdxRef = { current: -1 }

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        description: initial.description,
        activityCategory: initial.activityCategory,
        furnitureType: initial.furnitureType,
        basePrice: String(initial.basePrice),
        discountPct: initial.discountPct ? String(initial.discountPct) : "",
        images: [...initial.images],
        sku: initial.sku,
        active: initial.active,
      })
    } else setForm(empty)
    setErrors({})
  }, [initial])

  const set = <K extends keyof FS>(k: K, v: FS[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const discountedPreview = useMemo(() => {
    const b = Number(form.basePrice)
    const d = Number(form.discountPct)
    if (!b || !d || d < 0 || d > 100) return null
    return Math.round(b * (1 - d / 100) * 100) / 100
  }, [form.basePrice, form.discountPct])

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Nome obbligatorio"
    if (!form.description.trim()) e.description = "Descrizione breve obbligatoria"
    if (!form.activityCategory.trim()) e.activityCategory = "Categoria obbligatoria"
    if (!form.furnitureType.trim()) e.furnitureType = "Tipologia obbligatoria"
    const b = Number(form.basePrice)
    if (!form.basePrice || isNaN(b) || b <= 0) e.basePrice = "Prezzo base > 0"
    if (form.discountPct) {
      const d = Number(form.discountPct)
      if (isNaN(d) || d < 0 || d > 100) e.discountPct = "Sconto % tra 0 e 100"
    }
    if (!form.sku.trim()) e.sku = "SKU obbligatorio"
    else if (all.some((p) => p.id !== initial?.id && p.sku === form.sku.trim()))
      e.sku = "SKU già in uso"
    if (form.images.length === 0) e.images = "Aggiungi almeno un'immagine"
    return e
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const data: Omit<Product, "id" | "createdAt" | "updatedAt" | "slug"> & { slug?: string } = {
      name: form.name.trim(),
      description: form.description.trim(),
      activityCategory: form.activityCategory,
      furnitureType: form.furnitureType,
      basePrice: Number(form.basePrice),
      discountPct: form.discountPct ? Number(form.discountPct) : null,
      images: form.images,
      sku: form.sku.trim(),
      active: form.active,
    }
    await onSave(data, initial?.id)
  }

  const addImagesFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"))
    const urls: string[] = []
    for (const f of arr)
      urls.push(
        await new Promise<string>((r) => {
          const rd = new FileReader()
          rd.onload = () => r(String(rd.result))
          rd.readAsDataURL(f)
        }),
      )
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
  }
  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addImagesFiles(e.target.files)
    e.target.value = ""
  }
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files?.length) addImagesFiles(e.dataTransfer.files)
  }
  const addPlaceholder = () =>
    setForm((f) => ({
      ...f,
      images: [
        ...f.images,
        `https://placehold.co/1200x800/EAE7E0/1A1A18?text=Showroom-${Date.now().toString(36)}`,
      ],
    }))
  const removeImg = (i: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, k) => k !== i) }))
  const moveImg = (from: number, to: number) => {
    setForm((f) => {
      const n = [...f.images]
      const [it] = n.splice(from, 1)
      n.splice(to, 0, it)
      return { ...f, images: n }
    })
  }

  const inCls = (err?: string) =>
    `w-full border ${
      err ? "border-red-400" : "border-[#DDD9D0] focus:border-[#1B4332]"
    } bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:outline-none`

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4 animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <form
        onSubmit={submit}
        className="bg-white w-full max-w-4xl max-h-[92vh] overflow-hidden border border-[#DDD9D0] shadow-2xl flex flex-col"
      >
        <div className="px-6 py-4 border-b border-[#EAE7E0] flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-display text-xl font-medium text-[#1A1A18]">
            {initial ? "Modifica prodotto" : "Nuovo prodotto"}
          </h2>
          <button type="button" onClick={onCancel} className="text-sm text-[#888580] hover:text-[#1A1A18]">
            ✕ Chiudi
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Nome prodotto *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inCls(errors.name)} />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">SKU *</label>
              <input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                className={inCls(errors.sku) + " font-mono"}
              />
              {errors.sku && <p className="text-xs text-red-600 mt-1">{errors.sku}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Descrizione breve *</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={inCls(errors.description) + " resize-none"}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Categoria attività *</label>
              <CategorySelect
                value={form.activityCategory}
                onChange={(v) => set("activityCategory", v)}
                error={errors.activityCategory}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Tipologia arredo *</label>
              <FurnitureTypeSelect
                value={form.furnitureType}
                onChange={(v) => set("furnitureType", v)}
                error={errors.furnitureType}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Prezzo base (€) *</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.basePrice}
                onChange={(e) => set("basePrice", e.target.value)}
                className={inCls(errors.basePrice)}
              />
              {errors.basePrice && <p className="text-xs text-red-600 mt-1">{errors.basePrice}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Sconto %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.discountPct}
                onChange={(e) => set("discountPct", e.target.value)}
                className={inCls(errors.discountPct)}
              />
              {errors.discountPct && <p className="text-xs text-red-600 mt-1">{errors.discountPct}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Prezzo scontato (calcolato)
              </label>
              <div className="px-3 py-2.5 border border-[#EAE7E0] bg-[#FAFAF7] text-sm">
                {discountedPreview !== null ? (
                  <span className="font-semibold text-[#1B4332]">€ {discountedPreview.toLocaleString("it-IT")}</span>
                ) : (
                  <span className="text-[#888580]">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="pf-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
              className="w-4 h-4 accent-[#1B4332]"
            />
            <label htmlFor="pf-active" className="text-sm font-medium text-[#4A4A46]">
              {form.active ? "✅ Prodotto attivo (visibile nel listino)" : "⏸ Inattivo"}
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <h3 className="text-xs uppercase tracking-wide text-[#888580]">Immagini prodotto *</h3>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#1B4332] font-medium hover:underline cursor-pointer">
                  ＋ Seleziona file
                  <input type="file" accept="image/*" multiple hidden onChange={onFiles} />
                </label>
                <button type="button" onClick={addPlaceholder} className="text-xs text-[#888580] hover:text-[#1B4332]">
                  Placeholder
                </button>
              </div>
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault()
              }}
              onDrop={onDrop}
              className={`border-2 border-dashed p-3 ${
                errors.images ? "border-red-400" : "border-[#DDD9D0]"
              } bg-[#F7F5F0]`}
            >
              {form.images.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-4xl text-[#DDD9D0] mb-2">🖼️</div>
                  <p className="text-sm text-[#4A4A46]">Trascina immagini qui o clicca sopra</p>
                  {errors.images && <p className="text-xs text-red-600 mt-2">{errors.images}</p>}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {form.images.map((url, i) => (
                    <div
                      key={url.slice(-30) + i}
                      draggable
                      onDragStart={() => (dragIdxRef.current = i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIdxRef.current !== -1 && dragIdxRef.current !== i)
                          moveImg(dragIdxRef.current, i)
                        dragIdxRef.current = -1
                      }}
                      className="relative aspect-[4/3] overflow-hidden border bg-white cursor-move group"
                    >
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      {i === 0 && (
                        <div className="absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1B4332] text-white">
                          Copertina
                        </div>
                      )}
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImg(i, 0)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#1B4332] shadow"
                          >
                            ★ Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImg(i)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white shadow"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#EAE7E0] flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-[#888580]">
            I campi con <span className="text-red-600">*</span> sono obbligatori
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="border border-[#DDD9D0] px-5 py-2.5 text-sm hover:bg-[#F7F5F0] disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={busy}
              className="bg-[#1B4332] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#143326] disabled:opacity-50 flex items-center gap-2"
            >
              {busy && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {initial ? "Aggiorna" : "Crea prodotto"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
