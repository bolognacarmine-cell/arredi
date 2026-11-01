import type { FaqItem } from '../../api/blogApi'

interface BlogFaqProps {
  faq: FaqItem[]
  /** Titolo della sezione (di default "Domande frequenti"). */
  title?: string
}

/**
 * Sezione FAQ visibili in pagina.
 *
 * Il contenuto è ESPOSTO (non nascosto in <details>): Google richiede che le
 * domande del JSON-LD FAQPage siano effettivamente presenti nel testo della
 * pagina. Lo schema JSON-LD viene generato in BlogPost.tsx.
 */
export default function BlogFaq({ faq, title = 'Domande frequenti' }: BlogFaqProps) {
  const items = (faq || []).filter(
    (item) => item && item.question?.trim() && item.answer?.trim()
  )

  if (items.length === 0) return null

  return (
    <section id="faq" className="mt-12 scroll-mt-28 border-t border-[var(--border)] pt-8">
      <h2 className="mb-6 font-display text-2xl font-bold text-[var(--foreground)]">{title}</h2>

      <div className="space-y-5">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-[var(--border)] bg-white p-5 sm:p-6"
          >
            <h3 className="mb-2 font-display text-base sm:text-lg font-bold text-[var(--foreground)]">
              {item.question.trim()}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-[15px]">
              {item.answer.trim()}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
