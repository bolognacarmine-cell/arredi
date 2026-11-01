import type { FaqItem } from "../../../api/blogApi"
import { labelCls, textareaCls, inputCls, hintCls } from "../blog/blogStyles"

interface FaqEditorProps {
  value: FaqItem[]
  onChange: (items: FaqItem[]) => void
  errors?: Record<string, string>
}

/**
 * FAQ ripetibili (domanda/risposta).
 *
 * Ogni voce alimenta sia la sezione visibile in pagina sia lo schema.org
 * FAQPage generato nella pagina articolo.
 */
export default function FaqEditor({ value, onChange, errors = {} }: FaqEditorProps) {
  const items = value || []

  const update = (index: number, patch: Partial<FaqItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const add = () => {
    if (items.length >= 20) return
    onChange([...items, { question: "", answer: "" }])
  }

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  return (
    <div>
      <p className={`${hintCls} mb-3`}>
        Le domande vengono mostrate nella pagina articolo e nello schema strutturato
        FAQPage (utente per i risultati ricchi di Google). Da 3 a 5 domande è il formato migliore.
      </p>

      {items.length === 0 && (
        <p className="mb-3 rounded border border-dashed border-[#DDD9D0] bg-[#F7F5F0] px-3 py-4 text-xs text-[#888580]">
          Nessuna domanda inserita. Puoi aggiungerne in qualsiasi momento.
        </p>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border border-[#DDD9D0] bg-[#FAFAF7] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#888580]">
                Domanda {index + 1}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Sposta la domanda su"
                  className="min-h-[32px] rounded border border-[#DDD9D0] bg-white px-2 text-xs transition-colors hover:bg-[#EAE7E0] disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Sposta la domanda giù"
                  className="min-h-[32px] rounded border border-[#DDD9D0] bg-white px-2 text-xs transition-colors hover:bg-[#EAE7E0] disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Elimina la domanda ${index + 1}`}
                  className="min-h-[32px] rounded border border-red-200 bg-white px-2 text-xs text-red-600 transition-colors hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            </div>

            <label className={labelCls} htmlFor={`faq-q-${index}`}>
              Domanda
            </label>
            <input
              id={`faq-q-${index}`}
              type="text"
              value={item.question}
              onChange={(e) => update(index, { question: e.target.value })}
              placeholder="Es. Quanto costa arredare un barbiere a Caserta?"
              className={inputCls}
            />
            {errors[`faq.${index}.question`] && (
              <span className="mt-1 block text-xs text-red-600">
                {errors[`faq.${index}.question`]}
              </span>
            )}

            <label className={`${labelCls} mt-3`} htmlFor={`faq-a-${index}`}>
              Risposta
            </label>
            <textarea
              id={`faq-a-${index}`}
              value={item.answer}
              onChange={(e) => update(index, { answer: e.target.value })}
              rows={3}
              placeholder="Risposta sintetica e diretta (60-120 parole)."
              className={textareaCls}
            />
            {errors[`faq.${index}.answer`] && (
              <span className="mt-1 block text-xs text-red-600">
                {errors[`faq.${index}.answer`]}
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        disabled={items.length >= 20}
        className="mt-4 min-h-[40px] rounded border border-[#DDD9D0] px-4 py-2 text-sm font-medium text-[#1B4332] transition-colors hover:bg-[#EAE7E0] disabled:opacity-50"
      >
        + Aggiungi domanda
      </button>
    </div>
  )
}
