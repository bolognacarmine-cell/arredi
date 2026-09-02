// Form modale crea/modifica offerta showroom (con campi Other separati)
import { useEffect, useMemo, useState } from "react"
import CategorySelect from "../../../components/admin/showroom/CategorySelect"
import FurnitureTypeSelect from "../../../components/admin/showroom/FurnitureTypeSelect"
import type { Offer } from "../../../types/showroom"
import type { ActivityCategoryOption } from "../../../constants/showroomCategories"
import type { FurnitureTypeOption } from "../../../constants/furnitureTypes"
import { offerBadge, useProducts } from "../../../services/showroomApi"

interface Props {
  initial?: Offer
  onCancel: () => void
  onSave: (
    data: Omit<Offer, "id" | "createdAt" | "updatedAt">,
    id?: string,
  ) => Promise<void> | void
  busy?: boolean
}

type FS = Omit<Offer, "id" | "createdAt" | "updatedAt">

const today = () => new Date().toISOString().slice(0, 10)
const addDays = (d: string, n: number) => {
  const x = new Date(d + "T00:00:00")
  x.setDate(x.getDate() + n)
  return x.toISOString().slice(0, 10)
}

const empty: FS = {
  title: "",
  description: "",
  activityCategory: "Barberie",
  activityCategoryOther: "",
  furnitureType: "Altro",
  furnitureTypeOther: "",
  discountType: "percent",
  discountValue: 10,
  productIds: [],
  startDate: today(),
  endDate: addDays(today(), 30),
  active: true,
}

export default function OfferForm({ initial, onCancel, onSave, busy }: Props) {
  const products = useProducts()
  const [form, setForm] = useState<FS>(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initial)
      setForm({
        ...initial,
        activityCategoryOther: initial.activityCategoryOther ?? "",
        furnitureTypeOther: initial.furnitureTypeOther ?? "",
      })
    else setForm(empty)
    setErrors({})
  }, [initial])

  const set = <K extends keyof FS>(k: K, v: FS[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const badgePreview = useMemo(() => {
    const v = Number(form.discountValue)
    if (isNaN(v) || v < 0) return null
    return offerBadge({ discountType: form.discountType, discountValue: v })
  }, [form.discountType, form.discountValue])

  const toggleProduct = (id: string) => {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((x) => x !== id)
        : [...f.productIds, id],
    }))
  }

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Titolo obbligatorio"
    if (!form.description.trim()) e.description = "Descrizione obbligatoria"
    if (!form.activityCategory) e.activityCategory = "Categoria obbligatoria"
    if (form.activityCategory === "Altro" && !form.activityCategoryOther.trim())
      e.activityCategory = 'Specifica la categoria "Altro"'
    if (!form.furnitureType) e.furnitureType = "Tipologia obbligatoria"
    if (form.furnitureType === "Altro" && !form.furnitureTypeOther.trim())
      e.furnitureType = 'Specifica la tipologia "Altro"'
    const v = Number(form.discountValue)
    if (isNaN(v) || v <= 0) e.discountValue = "Valore sconto > 0"
    if (form.discountType === "percent" && v > 100) e.discountValue = "% massimo 100"
    if (!form.startDate) e.startDate = "Data inizio obbligatoria"
    if (!form.endDate) e.endDate = "Data fine obbligatoria"
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      e.endDate = "Fine deve essere dopo inizio"
    if (form.productIds.length === 0) e.productIds = "Seleziona almeno 1 prodotto"
    return e
  }

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const data: FS = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      discountValue: Number(form.discountValue),
      activityCategoryOther:
        form.activityCategory === "Altro" ? form.activityCategoryOther.trim() : undefined,
      furnitureTypeOther:
        form.furnitureType === "Altro" ? form.furnitureTypeOther.trim() : undefined,
    }
    await onSave(data, initial?.id)
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
            {initial ? "Modifica offerta" : "Nuova offerta"}
          </h2>
          <button type="button" onClick={onCancel} className="text-sm text-[#888580] hover:text-[#1A1A18]">
            ✕ Chiudi
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Titolo *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inCls(errors.title)} />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Badge (calcolato)</label>
              <div className="px-3 py-2.5 border border-[#EAE7E0] bg-[#FAFAF7] text-sm">
                {badgePreview ? (
                  <span
                    className="font-bold px-2.5 py-1 text-white rounded text-xs"
                    style={{ background: form.discountType === "percent" ? "#B5965A" : "#1B4332" }}
                  >
                    {badgePreview}
                  </span>
                ) : (
                  <span className="text-[#888580]">—</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Descrizione breve *</label>
            <textarea
              rows={2}
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
                value={form.activityCategory as ActivityCategoryOption}
                otherValue={form.activityCategoryOther ?? ""}
                onChange={(v) => set("activityCategory", v)}
                onOtherChange={(v) => set("activityCategoryOther", v)}
                error={errors.activityCategory}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Tipologia arredo *</label>
              <FurnitureTypeSelect
                value={form.furnitureType as FurnitureTypeOption}
                otherValue={form.furnitureTypeOther ?? ""}
                onChange={(v) => set("furnitureType", v)}
                onOtherChange={(v) => set("furnitureTypeOther", v)}
                error={errors.furnitureType}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Tipo sconto *</label>
              <select
                value={form.discountType}
                onChange={(e) => set("discountType", e.target.value as "percent" | "fixed")}
                className={inCls()}
              >
                <option value="percent">Percentuale (%)</option>
                <option value="fixed">Fisso (€)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">
                Valore sconto {form.discountType === "percent" ? "(%)" : "(€)"}*
              </label>
              <input
                type="number"
                min={0}
                max={form.discountType === "percent" ? 100 : undefined}
                step={form.discountType === "fixed" ? "0.01" : "1"}
                value={String(form.discountValue)}
                onChange={(e) => set("discountValue", Number(e.target.value))}
                className={inCls(errors.discountValue)}
              />
              {errors.discountValue && <p className="text-xs text-red-600 mt-1">{errors.discountValue}</p>}
            </div>
            <div className="flex items-center">
              <input
                id="of-active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="w-4 h-4 accent-[#1B4332] mr-2"
              />
              <label htmlFor="of-active" className="text-sm font-medium text-[#4A4A46]">
                {form.active ? "✅ Offerta attiva" : "⏸ Inattiva"}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Data inizio *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inCls(errors.startDate)}
              />
              {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#888580]">Data fine *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className={inCls(errors.endDate)}
              />
              {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <label className="text-xs uppercase tracking-wide text-[#888580]">
                Prodotti inclusi ({form.productIds.length}) *
              </label>
              {products.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "productIds",
                        products.map((p) => p.id),
                      )
                    }
                    className="text-[#1B4332] hover:underline"
                  >
                    Seleziona tutti
                  </button>
                  <button
                    type="button"
                    onClick={() => set("productIds", [])}
                    className="text-[#888580] hover:text-[#1B4332]"
                  >
                    Nessuno
                  </button>
                </div>
              )}
            </div>
            {errors.productIds && <p className="text-xs text-red-600 mb-2">{errors.productIds}</p>}
            <div className="border border-[#DDD9D0] bg-[#F7F5F0] max-h-72 overflow-y-auto divide-y divide-[#EAE7E0]">
              {products.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#888580]">
                  Nessun prodotto disponibile. Crea prima i prodotti.
                </div>
              ) : (
                products.map((p) => {
                  const checked = form.productIds.includes(p.id)
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white ${
                        checked ? "bg-white" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#1B4332]"
                        checked={checked}
                        onChange={() => toggleProduct(p.id)}
                      />
                      {p.images[0] && (
                        <img src={p.images[0]} className="h-9 w-9 object-cover border bg-white" alt="" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs text-[#888580] truncate">
                          <span className="font-mono">{p.sku}</span>
                        </div>
                      </div>
                      <div className="text-xs tabular-nums">€ {p.basePrice.toLocaleString("it-IT")}</div>
                    </label>
                  )
                })
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
              {initial ? "Aggiorna" : "Crea offerta"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
