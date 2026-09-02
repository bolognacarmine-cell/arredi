// pages/admin/showroom/OfferForm.tsx
// Form modale per Crea / Modifica Offerta Promozionale.
// - Validazione client: titolo, sconto, prodotti selezionati, date.
// - Multi-select prodotti con ricerca live.
// - Anteprima BADGE in tempo reale ("-20%" o "50€ OFF" ecc.) in base a
//   tipo sconto + valore.
// - Stato attivo / disattivo.

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  useShowroomProducts,
  type Offer,
  type Offer as OfferT,
} from "../../../services/showroomApi"

interface Props {
  initial?: OfferT
  onCancel: () => void
  onSave: (
    data: Omit<OfferT, "id" | "createdAt" | "updatedAt">,
    id?: string,
  ) => void | Promise<void>
  busy?: boolean
}

type FormState = {
  title: string
  description: string
  discountType: "percent" | "fixed"
  discountValue: string
  productIds: string[]
  startDate: string
  endDate: string
  active: boolean
  badgeText: string
}

const today = new Date()
const ISO = (d: Date) => d.toISOString().slice(0, 10)
const in14d = new Date(today.getTime() + 14 * 86_400_000)

const emptyForm: FormState = {
  title: "",
  description: "",
  discountType: "percent",
  discountValue: "10",
  productIds: [],
  startDate: ISO(today),
  endDate: ISO(in14d),
  active: true,
  badgeText: "",
}

type Errors = Partial<Record<keyof FormState, string>> & {
  __general?: string
}

export default function OfferForm({ initial, onCancel, onSave, busy }: Props) {
  const products = useShowroomProducts()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Errors>({})
  const [productQuery, setProductQuery] = useState("")

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description,
        discountType: initial.discountType,
        discountValue: String(initial.discountValue),
        productIds: [...initial.productIds],
        startDate: initial.startDate,
        endDate: initial.endDate,
        active: initial.active,
        badgeText: initial.badgeText,
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
    setProductQuery("")
  }, [initial])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  // Auto-popola badgeText suggerito se l'utente non scrive nulla
  useEffect(() => {
    if (form.badgeText.trim()) return
    const auto =
      form.discountType === "percent"
        ? `-${Number(form.discountValue) || 0}%`
        : `${Number(form.discountValue) || 0}€ OFF`
    setForm((f) => (f.badgeText ? f : { ...f, badgeText: auto }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.discountType, form.discountValue, initial])

  const previewBadge = useMemo(() => {
    if (form.badgeText.trim()) return form.badgeText.trim()
    return form.discountType === "percent"
      ? `-${Number(form.discountValue) || 0}%`
      : `${Number(form.discountValue) || 0}€ OFF`
  }, [form.badgeText, form.discountType, form.discountValue])

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    const arr = products
      .filter((p) => p.active)
      .map((p) => {
        const alreadyIn = form.productIds.includes(p.id)
        return { p, alreadyIn }
      })
    if (!q) return arr
    return arr.filter(({ p }) => {
      const hay = (
        p.name +
        " " +
        p.category +
        " " +
        p.sku +
        " " +
        p.description
      ).toLowerCase()
      return hay.includes(q)
    })
  }, [products, productQuery, form.productIds])

  const toggleProduct = (id: string) => {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((x) => x !== id)
        : [...f.productIds, id],
    }))
  }

  const selectAllFiltered = () => {
    setForm((f) => {
      const ids = filteredProducts.map(({ p }) => p.id)
      const combined = Array.from(new Set([...f.productIds, ...ids]))
      return { ...f, productIds: combined }
    })
  }

  const clearSelection = () => set("productIds", [])

  const eur = (n: number) =>
    n.toLocaleString("it-IT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    })

  const saveExample = useMemo(() => {
    if (form.productIds.length === 0) return null
    const sample = products.find((p) => p.id === form.productIds[0])
    if (!sample) return null
    const value = Number(form.discountValue)
    const final =
      form.discountType === "percent"
        ? Math.max(0, sample.basePrice * (1 - value / 100))
        : Math.max(0, sample.basePrice - value)
    return {
      name: sample.name,
      before: sample.basePrice,
      after: Math.round(final * 100) / 100,
    }
  }, [form.productIds, form.discountType, form.discountValue, products])

  const validate = (): Errors => {
    const next: Errors = {}
    if (!form.title.trim()) next.title = "Inserisci il titolo dell'offerta"
    else if (form.title.length < 4)
      next.title = "Il titolo è troppo corto (min. 4 caratteri)"
    const v = Number(form.discountValue)
    if (!form.discountValue) next.discountValue = "Inserisci il valore sconto"
    else if (isNaN(v) || v <= 0)
      next.discountValue = "Il valore deve essere maggiore di 0"
    else if (form.discountType === "percent" && v > 100)
      next.discountValue = "Lo sconto percentuale non può superare il 100%"
    if (form.productIds.length === 0)
      next.productIds = "Seleziona almeno un prodotto"
    if (!form.startDate) next.startDate = "Data inizio obbligatoria"
    if (!form.endDate) next.endDate = "Data fine obbligatoria"
    if (
      form.startDate &&
      form.endDate &&
      new Date(form.startDate) > new Date(form.endDate + "T23:59:59")
    ) {
      next.endDate = "La fine deve essere successiva all'inizio"
    }
    return next
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return
    const payload: Omit<Offer, "id" | "createdAt" | "updatedAt"> = {
      title: form.title.trim(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      productIds: form.productIds,
      startDate: form.startDate,
      endDate: form.endDate,
      active: form.active,
      badgeText: previewBadge,
    }
    await onSave(payload, initial?.id)
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
        className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden border border-[#DDD9D0] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE7E0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <h2 className="font-display text-xl font-medium text-[#1A1A18]">
                {initial ? "Modifica offerta" : "Nuova offerta promozionale"}
              </h2>
              <p className="text-xs text-[#888580] mt-0.5">
                Associa prodotti, imposta lo sconto e la finestra temporale
              </p>
            </div>
            {/* Badge preview */}
            <div
              className="inline-flex items-center px-3 py-1.5 rounded text-sm font-bold text-white shadow"
              style={{
                background:
                  form.discountType === "percent" ? "#B5965A" : "#1B4332",
              }}
            >
              {previewBadge}
            </div>
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
          {/* Riga titolo / stato */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
            <Field
              label="Titolo offerta *"
              error={errors.title}
              input={
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="es. Collezione Autunno -18%"
                  className={inputCls(!!errors.title)}
                  autoFocus
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
                {form.active ? "✅ Attiva" : "⏸ Inattiva (bozza)"}
              </span>
            </label>
          </div>

          {/* Descrizione */}
          <Field
            label="Descrizione offerta"
            input={
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Condizioni, note commerciali, limitazioni…"
                className={inputCls(false) + " resize-none"}
              />
            }
          />

          {/* Riga sconto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Tipo sconto *"
              input={
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {(
                    [
                      { k: "percent", label: "Percentuale", symbol: "%" },
                      { k: "fixed", label: "Importo fisso", symbol: "€" },
                    ] as const
                  ).map((o) => {
                    const selected = form.discountType === o.k
                    return (
                      <button
                        type="button"
                        key={o.k}
                        onClick={() => set("discountType", o.k)}
                        className={`py-2.5 text-sm border transition-colors ${
                          selected
                            ? "bg-[#1B4332] border-[#1B4332] text-white"
                            : "bg-white border-[#DDD9D0] text-[#4A4A46] hover:bg-[#F7F5F0]"
                        }`}
                      >
                        <span className="font-semibold mr-1">{o.symbol}</span>
                        {o.label}
                      </button>
                    )
                  })}
                </div>
              }
            />
            <Field
              label="Valore sconto *"
              error={errors.discountValue}
              hint={
                form.discountType === "percent"
                  ? "1–100 (es. 18 = 18%)"
                  : "Importo in € (es. 500)"
              }
              input={
                <div className="flex items-center gap-2">
                  {form.discountType === "fixed" && (
                    <span className="text-[#888580] text-sm">€</span>
                  )}
                  <input
                    type="number"
                    min={0}
                    max={form.discountType === "percent" ? 100 : undefined}
                    step={form.discountType === "fixed" ? 1 : 1}
                    value={form.discountValue}
                    onChange={(e) => set("discountValue", e.target.value)}
                    className={inputCls(!!errors.discountValue)}
                  />
                  {form.discountType === "percent" && (
                    <span className="text-[#888580] text-sm">%</span>
                  )}
                </div>
              }
            />
            <Field
              label="Badge promozionale"
              hint="Testo visibile sul listino (es. -20%, 50€ OFF, Offerta limitata)"
              input={
                <input
                  type="text"
                  value={form.badgeText}
                  onChange={(e) => set("badgeText", e.target.value)}
                  placeholder={
                    form.discountType === "percent"
                      ? `-${form.discountValue || 0}%`
                      : `${form.discountValue || 0}€ OFF`
                  }
                  className={inputCls(false)}
                />
              }
            />
          </div>

          {/* Riga date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Data inizio *"
              error={errors.startDate}
              input={
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  className={inputCls(!!errors.startDate)}
                />
              }
            />
            <Field
              label="Data fine *"
              error={errors.endDate}
              input={
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                  className={inputCls(!!errors.endDate)}
                />
              }
            />
          </div>

          {/* Esempio calcolo */}
          {saveExample && (
            <div className="bg-[#F7F5F0] border border-[#EAE7E0] px-4 py-3 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-[#888580] mb-1">
                  Esempio calcolo
                </div>
                <div className="text-sm text-[#1A1A18]">
                  <span className="font-medium">{saveExample.name}</span>{" "}
                  <span className="text-[#888580] text-xs">(primo selezionato)</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs line-through text-[#888580]">
                  {eur(saveExample.before)}
                </div>
                <div className="text-lg font-display font-light text-[#1B4332]">
                  {eur(saveExample.after)}
                  <span className="text-xs font-normal text-[#B5965A] ml-2">
                    -{eur(saveExample.before - saveExample.after)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Selezione prodotti */}
          <div>
            <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
              <div>
                <h3 className="block text-xs uppercase tracking-wide text-[#888580] mb-1">
                  Prodotti inclusi *
                </h3>
                <p className="text-xs text-[#888580]">
                  {form.productIds.length === 0
                    ? "Nessun prodotto selezionato. Cerca e aggiungi quelli in promozione."
                    : `${form.productIds.length} ${
                        form.productIds.length === 1
                          ? "prodotto"
                          : "prodotti"
                      } selezionati.`}
                  {errors.productIds && (
                    <span className="ml-2 text-red-600">
                      {errors.productIds}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-xs text-[#1B4332] hover:underline"
                >
                  ✓ Seleziona tutti filtrati
                </button>
                <span className="text-[#DDD9D0]">|</span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs text-[#888580] hover:text-red-600"
                >
                  Rimuovi tutti
                </button>
              </div>
            </div>

            <div className="border border-[#DDD9D0] bg-[#F7F5F0]">
              <div className="border-b border-[#EAE7E0] bg-white p-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888580] text-sm">
                    🔎
                  </span>
                  <input
                    type="text"
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="Cerca prodotto per nome, categoria, SKU…"
                    className="w-full pl-9 pr-3 py-2 border border-[#DDD9D0] bg-[#FAFAF7] text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
                  />
                </div>
              </div>

              <div className="max-h-[280px] overflow-y-auto divide-y divide-[#EAE7E0]">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-10 text-[#888580] text-sm">
                    Nessun prodotto corrisponde alla ricerca
                  </div>
                ) : (
                  filteredProducts.map(({ p, alreadyIn }) => {
                    const inSelection = form.productIds.includes(p.id)
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                          inSelection
                            ? "bg-[#1B4332]/5"
                            : alreadyIn
                              ? "bg-white/60"
                              : "hover:bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#1B4332] flex-shrink-0"
                          checked={inSelection}
                          onChange={() => toggleProduct(p.id)}
                        />
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden border border-[#EAE7E0] bg-white">
                          {p.images[0] && (
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#1A1A18] truncate">
                            {p.name}
                          </div>
                          <div className="text-xs text-[#888580] truncate">
                            {p.category} ·{" "}
                            <span className="font-mono">{p.sku}</span> ·{" "}
                            <span className="tabular-nums">{eur(p.basePrice)}</span>
                          </div>
                        </div>
                        <div className="text-right text-xs tabular-nums flex-shrink-0">
                          <span className="text-[#1A1A18] font-medium">
                            {eur(
                              form.discountType === "percent"
                                ? Math.max(
                                    0,
                                    p.basePrice *
                                      (1 - Number(form.discountValue) / 100),
                                  )
                                : Math.max(
                                    0,
                                    p.basePrice - Number(form.discountValue),
                                  ),
                            )}
                          </span>
                        </div>
                      </label>
                    )
                  })
                )}
              </div>
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
              className="bg-[#B5965A] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#a07f46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {busy ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvataggio…
                </>
              ) : initial ? (
                "Aggiorna offerta"
              ) : (
                "Crea offerta"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function inputCls(error: boolean) {
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
  input: ReactNode
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
