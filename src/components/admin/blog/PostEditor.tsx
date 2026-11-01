import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  clearFormatting,
  formatContent,
  looksLikeHtml,
  looksLikeMarkdown,
} from "../../../lib/markdown"

interface PostEditorProps {
  value: string
  onChange: (html: string) => void
  error?: string
}

type Tool =
  | "h2" | "h3" | "p" | "bold" | "italic" | "link" | "ul" | "ol"
  | "quote" | "table" | "image" | "video" | "clear" | "undo"

const TOOLS: Array<{ id: Tool; label: string; title: string }> = [
  { id: "h2", label: "H2", title: "Titolo di sezione" },
  { id: "h3", label: "H3", title: "Sottotitolo" },
  { id: "p", label: "¶", title: "Paragrafo" },
  { id: "bold", label: "B", title: "Grassetto" },
  { id: "italic", label: "I", title: "Corsivo" },
  { id: "link", label: "🔗", title: "Link (interno o esterno)" },
  { id: "ul", label: "• Lista", title: "Elenco puntato" },
  { id: "ol", label: "1. Lista", title: "Elenco numerato" },
  { id: "quote", label: "❝", title: "Citazione" },
  { id: "table", label: "▦ Tabella", title: "Inserisci tabella" },
  { id: "image", label: "🖼", title: "Immagine con alt text" },
  { id: "video", label: "▶", title: "Video (embed opzionale)" },
  { id: "clear", label: "Tx", title: "Rimuovi formattazione dalla selezione" },
  { id: "undo", label: "↩", title: "Annulla" },
]

const DEFAULT_TABLE = `
<table>
  <thead><tr><th>Voce</th><th>Dettaglio</th></tr></thead>
  <tbody>
    <tr><td>Voce 1</td><td>Descrizione</td></tr>
    <tr><td>Voce 2</td><td>Descrizione</td></tr>
  </tbody>
</table><p><br></p>`

/** Converte un URL YouTube/Vimeo in iframe embed, altrimenti lascia il link. */
function embedFromUrl(url: string): string | null {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/)
  if (youtube) {
    return `<iframe src="https://www.youtube.com/embed/${youtube[1]}" title="Video" loading="lazy" allowfullscreen></iframe>`
  }
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) {
    return `<iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="Video" loading="lazy" allowfullscreen></iframe>`
  }
  return null
}

/**
 * Editor del contenuto articolo.
 *
 * Implementato con contenteditable + document.execCommand: nessuna dipendenza
 * esterna (vincolo "non introdurre librerie inutili"). Fornisce inoltre la
 * modalità "Sorgente HTML" per il controllo diretto del markup.
 *
 * Incollando un articolo in Markdown il contenuto viene convertito in HTML
 * automaticamente (`src/lib/markdown.ts`); gli stessi pulsanti "Formatta
 * automaticamente" e "Pulisci formattazione" permettono di rifarlo a mano.
 */
export default function PostEditor({ value, onChange, error }: PostEditorProps) {
  const editableRef = useRef<HTMLDivElement | null>(null)
  // "" iniziale: il primo passaggio dell'effect scrive il valore di partenza nel DOM
  const lastEmitted = useRef<string>("")
  const [sourceMode, setSourceMode] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  // Anteprima live: `formatContent` è idempotente, quindi mostra il risultato
  // già formattato sia per l'HTML sia per il Markdown non ancora convertito.
  const previewHtml = useMemo(() => formatContent(value), [value])

  // Sync esterno → DOM (solo quando il valore cambia davvero fuori dall'editor,
  // così non si perde la posizione del cursore mentre si scrive).
  // `sourceMode` è nelle dipendenze: uscendo dalla modalità sorgente l'area
  // viene rimontata vuota e va riscritta.
  useEffect(() => {
    if (sourceMode) return
    const el = editableRef.current
    if (!el) return
    if (value !== lastEmitted.current && el.innerHTML !== value) {
      el.innerHTML = value
      lastEmitted.current = value
    }
  }, [value, sourceMode])

  const emit = useCallback(() => {
    const el = editableRef.current
    if (!el) return
    const html = el.innerHTML
    lastEmitted.current = html
    onChange(html)
  }, [onChange])

  const exec = useCallback(
    (command: string, argument?: string) => {
      editableRef.current?.focus()
      document.execCommand(command, false, argument)
      emit()
    },
    [emit]
  )

  const insertHtml = useCallback(
    (html: string) => {
      if (!html) return
      editableRef.current?.focus()
      document.execCommand("insertHTML", false, html)
      emit()
    },
    [emit]
  )

  /** Sostituisce l'intero contenuto (funziona sia nell'editor visivo sia nel sorgente). */
  const replaceContent = useCallback(
    (html: string) => {
      const el = editableRef.current
      if (el) {
        el.innerHTML = html
        lastEmitted.current = html
      } else {
        lastEmitted.current = ""
      }
      onChange(html)
    },
    [onChange]
  )

  /**
   * Incolla: se il testo è Markdown viene convertito in HTML, se è HTML viene
   * ripulito, altrimenti resta testo semplice (comportamento nativo).
   */
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const data = event.clipboardData
      if (!data) return

      const html = data.getData("text/html")
      const text = data.getData("text/plain")
      if (!html && !text) return

      // HTML "ricco" (pagina web, Word, Google Docs): ripulito e inserito
      if (html) {
        event.preventDefault()
        insertHtml(formatContent(html))
        return
      }

      // Markdown o HTML incollato come testo
      if (looksLikeMarkdown(text) || looksLikeHtml(text)) {
        event.preventDefault()
        insertHtml(formatContent(text))
        return
      }

      // Testo semplice: lascia fare al browser (mantiene il contesto inline)
      event.preventDefault()
      document.execCommand("insertText", false, text)
      emit()
    },
    [emit, insertHtml]
  )

  const handleAutoFormat = useCallback(() => {
    replaceContent(formatContent(value))
  }, [replaceContent, value])

  const handleClearFormatting = useCallback(() => {
    const plain = clearFormatting(value)
    if (plain === value) return
    const confirmed = window.confirm(
      "Rimuovere tutta la formattazione dal contenuto? Titoli, elenchi, link e grassetti diventeranno testo semplice. L'operazione non è annullabile."
    )
    if (!confirmed) return
    replaceContent(plain)
  }, [replaceContent, value])

  const runTool = (tool: Tool) => {
    switch (tool) {
      case "h2":
        exec("formatBlock", "<h2>")
        break
      case "h3":
        exec("formatBlock", "<h3>")
        break
      case "p":
        exec("formatBlock", "<p>")
        break
      case "bold":
        exec("bold")
        break
      case "italic":
        exec("italic")
        break
      case "ul":
        exec("insertUnorderedList")
        break
      case "ol":
        exec("insertOrderedList")
        break
      case "clear":
        exec("removeFormat")
        break
      case "undo":
        exec("undo")
        break
      case "quote":
        exec("formatBlock", "<blockquote>")
        break
      case "link": {
        const url = window.prompt("URL del link (/settori/barbieri oppure https://…)")
        if (!url) return
        const safe = url.trim()
        if (!safe.startsWith("/") && !/^https?:\/\//i.test(safe)) {
          window.alert("Inserisci un percorso interno (/pagina) o un URL http(s)")
          return
        }
        exec("createLink", safe)
        break
      }
      case "image": {
        const src = window.prompt("URL dell'immagine")
        if (!src) return
        const alt = window.prompt("Testo alternativo (alt text) — obbligatorio per la SEO") || ""
        insertHtml(
          `<img src="${src.trim()}" alt="${alt.replace(/"/g, "&quot;")}" width="1200" height="675" loading="lazy" decoding="async"><p><br></p>`
        )
        break
      }
      case "video": {
        const url = window.prompt("URL del video (YouTube/Vimeo) o file video")
        if (!url) return
        const embed = embedFromUrl(url.trim())
        insertHtml(embed || `<video src="${url.trim()}" controls loading="lazy"></video><p><br></p>`)
        break
      }
      case "table":
        insertHtml(DEFAULT_TABLE)
        break
      default:
        break
    }
  }

  /** Anteprima condivisa tra modalità visiva e sorgente HTML. */
  const previewPanel = (
    <div className="border border-[#DDD9D0] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2">
        <span className="text-xs uppercase tracking-wide text-[#888580]">Anteprima live</span>
        <button
          type="button"
          onClick={() => setShowPreview((current) => !current)}
          aria-expanded={showPreview}
          className="min-h-[32px] text-xs font-medium text-[#1B4332] underline underline-offset-2"
        >
          {showPreview ? "Nascondi anteprima" : "Mostra anteprima"}
        </button>
      </div>
      {showPreview &&
        (previewHtml ? (
          <div
            className="blog-content max-h-[420px] overflow-auto px-4 py-4"
            // HTML già passato da sanitizeHtml dentro formatContent
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <p className="px-4 py-4 text-sm text-[#888580]">
            L'anteprima dell'articolo formattato apparirà qui mentre scrivi o incolli il contenuto.
          </p>
        ))}
    </div>
  )

  if (sourceMode) {
    return (
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wide text-[#888580]">Sorgente HTML</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFormat}
              title="Converti il Markdown in HTML e ripulisci il codice"
              className="min-h-[32px] rounded border border-[#DDD9D0] bg-white px-2 py-1 text-xs font-medium text-[#4A4A46] transition-colors hover:bg-[#EAE7E0]"
            >
              Formatta automaticamente
            </button>
            <button
              type="button"
              onClick={handleClearFormatting}
              title="Rimuove titoli, elenchi, link e grassetti lasciando il testo"
              className="min-h-[32px] rounded border border-[#DDD9D0] bg-white px-2 py-1 text-xs font-medium text-[#4A4A46] transition-colors hover:bg-[#EAE7E0]"
            >
              Pulisci formattazione
            </button>
            <button
              type="button"
              onClick={() => {
                // L'area visiva verrà rimontata vuota: forza la riscrittura del contenuto
                lastEmitted.current = ""
                setSourceMode(false)
              }}
              className="min-h-[32px] text-xs font-medium text-[#1B4332] underline underline-offset-2"
            >
              Torna all'editor visivo
            </button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            aria-label="Sorgente HTML dell'articolo"
            className={`w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 font-mono text-xs text-[#1A1A18] focus:border-[#1B4332] focus:outline-none ${
              error ? "border-red-400" : ""
            }`}
            style={{ minHeight: "420px" }}
          />
          {previewPanel}
        </div>
        {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        className="flex flex-wrap gap-1 border border-[#DDD9D0] border-b-0 bg-[#F7F5F0] p-2 rounded-t-lg"
        role="toolbar"
        aria-label="Formattazione del contenuto"
      >
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            onMouseDown={(e) => {
              // impedisce al pulsante di rubare il focus all'editor
              e.preventDefault()
            }}
            onClick={() => runTool(tool.id)}
            className="min-h-[34px] min-w-[34px] rounded border border-transparent px-2 py-1 text-xs font-medium text-[#4A4A46] transition-colors hover:border-[#DDD9D0] hover:bg-white"
          >
            {tool.label}
          </button>
        ))}
        <span aria-hidden="true" className="mx-1 self-stretch border-l border-[#DDD9D0]" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleAutoFormat}
          title="Rileva il Markdown incollato, lo converte in HTML e ripulisce il codice"
          className="min-h-[34px] rounded border border-[#DDD9D0] bg-white px-2 py-1 text-xs font-medium text-[#1B4332] transition-colors hover:bg-[#EAE7E0]"
        >
          ✨ Formatta automaticamente
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClearFormatting}
          title="Rimuove titoli, elenchi, link e grassetti lasciando il testo"
          className="min-h-[34px] rounded border border-[#DDD9D0] bg-white px-2 py-1 text-xs font-medium text-[#4A4A46] transition-colors hover:bg-[#EAE7E0]"
        >
          Pulisci formattazione
        </button>
        <span aria-hidden="true" className="mx-1 self-stretch border-l border-[#DDD9D0]" />
        <button
          type="button"
          onClick={() => setSourceMode(true)}
          title="Modifica il codice HTML"
          className="min-h-[34px] rounded border border-[#DDD9D0] bg-white px-2 py-1 text-xs font-medium text-[#4A4A46] transition-colors hover:bg-[#EAE7E0]"
        >
          &lt;/&gt; HTML
        </button>
      </div>

      {/* Editor + anteprima live */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Area di scrittura: DOM controllato via ref (niente dangerouslySetInnerHTML,
            altrimenti React resettrebbe l'HTML a ogni tasto e perderebbe il cursore) */}
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Contenuto completo dell'articolo"
          onInput={emit}
          onBlur={emit}
          onPaste={handlePaste}
          data-placeholder="Scrivi qui l'articolo oppure incolla Markdown/HTML: usa H2 e H3 per le sezioni…"
          className={`blog-editor blog-content min-h-[420px] border bg-white px-4 py-4 focus:outline-none ${
            error ? "border-red-400" : "border-[#DDD9D0] focus:border-[#1B4332]"
          }`}
        />
        {previewPanel}
      </div>

      <div className="mt-1 flex items-start justify-between gap-3">
        <span className="text-xs text-[#888580]">
          Incolla un articolo in Markdown (## titoli, - elenchi, **grassetto**) e viene convertito
          automaticamente. H2/H3, tabelle e citazioni anche dalla barra in alto.
        </span>
        {error ? (
          <span className="text-xs text-red-600">{error}</span>
        ) : (
          <span className="text-xs text-[#888580]">{value.replace(/<[^>]+>/g, "").length} caratteri</span>
        )}
      </div>
    </div>
  )
}
