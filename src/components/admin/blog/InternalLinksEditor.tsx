import type { InternalLink } from "../../../api/blogApi"
import { labelCls, inputCls, hintCls } from "../blog/blogStyles"

interface InternalLinksEditorProps {
  value: InternalLink[]
  onChange: (items: InternalLink[]) => void
  errors?: Record<string, string>
}

/** Suggerimenti delle pagine di servizio più usate (i link si possono scrivere a mano). */
const SUGGESTIONS = [
  { label: "Arredi per barbieri e parrucchieri", url: "/settori/barbieri" },
  { label: "Arredamento negozi", url: "/settori/negozi" },
  { label: "Arredi per uffici", url: "/settori/uffici" },
  { label: "Arredi per bar", url: "/settori/bar" },
  { label: "Arredi per centri estetici", url: "/settori/centri-estetici" },
  { label: "Progetti realizzati", url: "/progetti" },
  { label: "Richiedi un preventivo", url: "/preventivo" },
  { label: "Contatti", url: "/contatti" },
]

/**
 * Link interni verso le pagine di servizio pertinenti (requisito SEO:
 * collegare ogni articolo alla landing e ai contatti).
 */
export default function InternalLinksEditor({ value, onChange, errors = {} }: InternalLinksEditorProps) {
  const items = value || []

  const update = (index: number, patch: Partial<InternalLink>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const add = (preset?: InternalLink) => {
    if (items.length >= 30) return
    onChange([...items, preset || { label: "", url: "" }])
  }

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <p className={`${hintCls} mb-3`}>
        Collega l'articolo alle pagine che approfondiscono lo stesso argomento
        (pagine servizio, progetti, preventivo, contatti).
      </p>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 border border-[#DDD9D0] bg-[#FAFAF7] p-3 sm:grid-cols-[1fr_1.4fr_auto]">
            <div>
              <label className={labelCls} htmlFor={`link-label-${index}`}>
                Etichetta
              </label>
              <input
                id={`link-label-${index}`}
                type="text"
                value={item.label}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder="Arredi per barbieri"
                className={inputCls}
              />
              {errors[`internalLinks.${index}.label`] && (
                <span className="text-xs text-red-600">
                  {errors[`internalLinks.${index}.label`]}
                </span>
              )}
            </div>

            <div>
              <label className={labelCls} htmlFor={`link-url-${index}`}>
                URL
              </label>
              <input
                id={`link-url-${index}`}
                type="text"
                value={item.url}
                onChange={(e) => update(index, { url: e.target.value })}
                placeholder="/settori/barbieri"
                className={`${inputCls} font-mono text-xs`}
              />
              {errors[`internalLinks.${index}.url`] && (
                <span className="text-xs text-red-600">
                  {errors[`internalLinks.${index}.url`]}
                </span>
              )}
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Elimina il link ${index + 1}`}
                className="min-h-[44px] rounded border border-red-200 bg-white px-3 text-xs text-red-600 transition-colors hover:bg-red-50"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => add()}
          disabled={items.length >= 30}
          className="min-h-[40px] rounded border border-[#DDD9D0] px-4 py-2 text-sm font-medium text-[#1B4332] transition-colors hover:bg-[#EAE7E0] disabled:opacity-50"
        >
          + Aggiungi link
        </button>
        <span className="text-xs text-[#888580]">Aggiuntivi rapidi:</span>
        {SUGGESTIONS.slice(0, 4).map((suggestion) => (
          <button
            key={suggestion.url}
            type="button"
            onClick={() => add(suggestion)}
            className="min-h-[32px] rounded-full border border-[#DDD9D0] bg-white px-3 py-1 text-xs text-[#4A4A46] transition-colors hover:border-[#1B4332] hover:text-[#1B4332]"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  )
}
