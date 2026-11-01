import { useCallback, useEffect, useRef, useState } from "react"

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
  { id: "clear", label: "Tx", title: "Rimuovi formattazione" },
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
 */
export default function PostEditor({ value, onChange, error }: PostEditorProps) {
  const editableRef = useRef<HTMLDivElement | null>(null)
  // "" iniziale: il primo passaggio dell'effect scrive il valore di partenza nel DOM
  const lastEmitted = useRef<string>("")
  const [sourceMode, setSourceMode] = useState(false)

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
      editableRef.current?.focus()
      document.execCommand("insertHTML", false, html)
      emit()
    },
    [emit]
  )

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

  if (sourceMode) {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-[#888580]">Sorgente HTML</span>
          <button
            type="button"
            onClick={() => {
              // L'area visiva verrà rimontata vuota: forza la riscrittura del contenuto
              lastEmitted.current = ""
              setSourceMode(false)
            }}
            className="text-xs font-medium text-[#1B4332] underline underline-offset-2 min-h-[32px]"
          >
            Torna all'editor visivo
          </button>
        </div>
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
          onClick={() => setSourceMode(true)}
          title="Modifica il codice HTML"
          className="min-h-[34px] rounded border border-[#DDD9D0] bg-white px-2 py-1 text-xs font-medium text-[#4A4A46] transition-colors hover:bg-[#EAE7E0]"
        >
          &lt;/&gt; HTML
        </button>
      </div>

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
        data-placeholder="Scrivi qui l'articolo: usa H2 e H3 per le sezioni…"
        className={`blog-editor blog-content min-h-[420px] border bg-white px-4 py-4 focus:outline-none ${
          error ? "border-red-400" : "border-[#DDD9D0] focus:border-[#1B4332]"
        }`}
      />
      <div className="mt-1 flex items-start justify-between gap-3">
        <span className="text-xs text-[#888580]">
          H2/H3 per le sezioni, tabelle e citazioni dalla barra in alto.
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
