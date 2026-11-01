/**
 * Conversione e pulizia del contenuto degli articoli.
 *
 * L'editor admin (`PostEditor`) permette di incollare un articolo scritto in
 * Markdown oppure HTML. Questo modulo, senza dipendenze esterne:
 *
 * 1. riconosce il formato del testo incollato (`looksLikeMarkdown` / `looksLikeHtml`);
 * 2. converte il Markdown in HTML semantico (`markdownToHtml`);
 * 3. ripulisce l'HTML con una allowlist di tag e attributi (`sanitizeHtml`),
 *    perché il contenuto viene pubblicato con `dangerouslySetInnerHTML`;
 * 4. riduce l'HTML a testo semplice (`htmlToPlainText`) per il pulsante
 *    "Pulisci formattazione";
 * 5. espone `formatContent`, il punto di ingresso usato dall'editor.
 *
 * Il risultato è sempre HTML "pulito", quindi viene salvato già convertito.
 */

// ---------------------------------------------------------------------------
// Costanti
// ---------------------------------------------------------------------------

/** Tag che possono finire nell'articolo pubblicato. */
const ALLOWED_TAGS = new Set([
  "p", "br", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote",
  "strong", "b", "em", "i", "u", "s", "mark", "small", "sup", "sub",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "hr", "code", "pre",
  "iframe", "video", "source",
])

/** Tag rimossi insieme a tutto il loro contenuto. */
const DROP_TAGS = new Set([
  "script", "style", "object", "embed", "form", "input", "button",
  "select", "option", "textarea", "link", "meta", "noscript", "template",
  "svg", "canvas",
])

/** Attributi ammessi per tag (oltre a quelli globali). */
const TAG_ATTRS: Record<string, string[]> = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height", "loading", "decoding"],
  iframe: ["src", "title", "width", "height", "loading", "allow", "allowfullscreen"],
  video: ["src", "poster", "width", "height", "controls", "preload"],
  source: ["src", "type"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan", "scope"],
  ol: ["start"],
}

const GLOBAL_ATTRS = ["title"]

/** Tag considerati "blocco" per la conversione in testo semplice. */
const BLOCK_TAGS = new Set([
  "p", "div", "section", "article", "header", "footer", "h1", "h2", "h3", "h4",
  "h5", "h6", "ul", "ol", "li", "blockquote", "table", "thead", "tbody", "tr",
  "figure", "figcaption", "pre", "hr",
])

const EMBED_HOSTS = /^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be|player\.vimeo\.com|vimeo\.com)\//i

// ---------------------------------------------------------------------------
// Utility di escaping
// ---------------------------------------------------------------------------

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function decodeHtml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
}

/** URL accettati: relativi, http(s), mailto, tel. Blocca javascript:, data:, vbscript:. */
function isSafeUrl(value: string): boolean {
  const url = value.trim()
  if (!url) return false
  if (/^(javascript|vbscript|data|file):/i.test(url)) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^(https?|mailto|tel):/i.test(url)) return false
  return true
}

// ---------------------------------------------------------------------------
// Riconoscimento del formato
// ---------------------------------------------------------------------------

const HTML_TAG_RE =
  /<\/?(h[1-6]|p|div|span|ul|ol|li|blockquote|table|thead|tbody|tr|td|th|img|a|strong|b|em|i|br|hr|figure|figcaption|iframe|video|source|pre|code|section|article)\b[^>]*>/i

const ESCAPED_HTML_RE =
  /&lt;\/?(h[1-6]|p|div|ul|ol|li|blockquote|table|img|a|strong|em|br|figure|iframe|pre|code)\b/i

/** `true` se il testo contiene markup HTML (anche con entità escapate). */
export function looksLikeHtml(text: string): boolean {
  if (!text || !text.trim()) return false
  return HTML_TAG_RE.test(text) || ESCAPED_HTML_RE.test(text)
}

/**
 * `true` se il testo sembra scritto in Markdown.
 *
 * Non basta un singolo simbolo: servono almeno due segnali "deboli", oppure
 * un blocco strutturale (heading/lista/citazione) più un segnale inline.
 * In questo modo una frase con un asterisco non viene stravolta.
 */
export function looksLikeMarkdown(text: string): boolean {
  if (!text || !text.trim()) return false

  const lines = text.replace(/\r\n?/g, "\n").split("\n")
  let blockSignals = 0
  for (const line of lines) {
    if (/^\s{0,3}#{1,6}\s+\S/.test(line)) blockSignals++
    else if (/^\s{0,3}>\s?\S/.test(line)) blockSignals++
    else if (/^\s{0,3}([-*+])\s+\S/.test(line)) blockSignals++
    else if (/^\s{0,3}\d+[.)]\s+\S/.test(line)) blockSignals++
    else if (/^\s{0,3}(```|~~~)/.test(line)) blockSignals++
  }
  // Un blocco strutturale (titolo, citazione, elenco, codice) è già un
  // segnale sufficiente: nella prosa normale queste forme non compaiono.
  if (blockSignals >= 1) return true

  // Segnali "forti": non compaiono quasi mai in una prosa normale.
  const hasBold =
    /\*\*[^*\n]+\*\*/.test(text) || /(^|[^\w_])__[^_\n]+__(?![\w_])/.test(text)
  const hasLink =
    /\[[^\]\n]+\]\([^)\s]+(?:\s+"[^"]*")?\)/.test(text) ||
    /!\[[^\]\n]*\]\([^)\s]+\)/.test(text)
  if (hasBold || hasLink) return true

  // Segnali "deboli": da soli non bastano.
  let weakSignals = 0
  if (/(^|[^*\w])\*[^*\n]+\*/.test(text)) weakSignals++
  if (/(^|[^\w_])_[^_\n]+_(?![\w_])/.test(text)) weakSignals++
  if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/m.test(text)) weakSignals++
  if (/`[^`\n]+`/.test(text)) weakSignals++

  if (blockSignals >= 1 && weakSignals >= 1) return true
  return weakSignals >= 2
}

// ---------------------------------------------------------------------------
// Markdown → HTML
// ---------------------------------------------------------------------------

/** `#` e `##` diventano h2 (l'h1 è il titolo dell'articolo), `###` h3, `####`+ h4. */
function headingLevel(hashes: number): number {
  if (hashes <= 2) return 2
  if (hashes === 3) return 3
  return 4
}

interface ListItemNode {
  html: string
  children: ListItemNode[]
}

const LIST_ITEM_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/

function isListLine(line: string): boolean {
  return LIST_ITEM_RE.test(line)
}

function isOrderedMarker(marker: string): boolean {
  return /^\d/.test(marker)
}

/** Formattazione inline: grassetto, corsivo, link, immagini, codice. */
function renderInline(text: string): string {
  // 1. code span protetti prima dell'escaping
  const codes: string[] = []
  let out = text.replace(/`([^`\n]+)`/g, (_match, code: string) => {
    codes.push(`<code>${escapeHtml(code)}</code>`)
    return `\u0000${codes.length - 1}\u0000`
  })

  // 2. escaping del testo rimanente (le virgolette diventano &quot;, così gli
  //    URL possono essere inseriti direttamente negli attributi)
  out = escapeHtml(out)

  // 3. immagini ![alt](url)
  out = out.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g,
    (match, alt: string, url: string) =>
      isSafeUrl(url)
        ? `<img src="${url}" alt="${alt}" width="1200" height="675" loading="lazy" decoding="async">`
        : match
  )

  // 4. link [etichetta](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g,
    (match, label: string, url: string) => {
      if (!isSafeUrl(url)) return label
      const external = /^https?:/i.test(url)
      const rel = external ? ' target="_blank" rel="noopener noreferrer"' : ""
      return `<a href="${url}"${rel}>${label}</a>`
    }
  )

  // 5. grassetto **testo** / __testo__
  out = out.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
  out = out.replace(/(^|[^\w_])__([^_\n]+)__(?![\w_])/g, "$1<strong>$2</strong>")

  // 6. corsivo *testo* / _testo_ (dopo il grassetto, così ** non viene spezzato)
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
  out = out.replace(/(^|[^\w_])_([^_\n]+)_(?![\w_])/g, "$1<em>$2</em>")

  // 7. a capo forzato: due spazi a fine riga
  out = out.replace(/ {2,}\n/g, "<br>\n")

  // 8. ripristino dei code span
  out = out.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => codes[Number(index)] ?? "")

  return out
}

/** Costruisce l'albero di una lista (supporta l'annidamento per indentazione). */
function parseList(lines: string[], start: number): { html: string; next: number } {
  const root: ListItemNode[] = []
  const first = lines[start].match(LIST_ITEM_RE)
  const baseIndent = first ? first[1].replace(/\t/g, "  ").length : 0

  const stack: Array<{ indent: number; items: ListItemNode[] }> = [
    { indent: baseIndent, items: root },
  ]
  const ordered = first ? isOrderedMarker(first[2]) : false
  let i = start

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      // riga vuota: la lista continua solo se la prossima riga è un item
      const nextLine = lines[i + 1]
      if (nextLine && isListLine(nextLine)) {
        i++
        continue
      }
      break
    }

    const match = line.match(LIST_ITEM_RE)
    if (!match) {
      // continuazione dell'item precedente (riga indentata)
      const current = stack[stack.length - 1]
      const last = current.items[current.items.length - 1]
      if (last && /^\s+/.test(line)) {
        last.html += ` ${renderInline(line.trim())}`
        i++
        continue
      }
      break
    }

    const indent = match[1].replace(/\t/g, "  ").length
    const content = renderInline(match[3].trim())

    // risali di livello finché l'indentazione non rientra
    while (stack.length > 1 && indent < stack[stack.length - 1].indent) stack.pop()

    // scendi di livello se l'item è più indentato del genitore
    if (indent > stack[stack.length - 1].indent) {
      const parentItems = stack[stack.length - 1].items
      const parent = parentItems[parentItems.length - 1]
      if (parent) stack.push({ indent, items: parent.children })
    }

    stack[stack.length - 1].items.push({ html: content, children: [] })
    i++
  }

  const renderItems = (items: ListItemNode[]): string =>
    items
      .map((item) => {
        const nested = item.children.length
          ? `<${ordered ? "ol" : "ul"}>${renderItems(item.children)}</${ordered ? "ol" : "ul"}>`
          : ""
        return `<li>${item.html}${nested}</li>`
      })
      .join("")

  const tag = ordered ? "ol" : "ul"
  return { html: `<${tag}>${renderItems(root)}</${tag}>`, next: i }
}

/**
 * Converte Markdown in HTML semantico.
 *
 * Supportati: heading `#`→h2 … `####`→h4, liste puntate e numerate (anche
 * annidate), citazioni `>`, grassetto, corsivo, link, immagini, codice inline,
 * blocchi di codice e righe orizzontali.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown || !markdown.trim()) return ""

  const lines = markdown.replace(/\r\n?/g, "\n").split("\n")
  const blocks: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    // Blocco di codice ```
    const fence = line.match(/^\s{0,3}(```|~~~)(.*)$/)
    if (fence) {
      const marker = fence[1]
      const body: string[] = []
      i++
      while (i < lines.length && !new RegExp(`^\\s{0,3}${marker}`).test(lines[i])) {
        body.push(lines[i])
        i++
      }
      i++ // riga di chiusura
      blocks.push(`<pre><code>${escapeHtml(body.join("\n"))}</code></pre>`)
      continue
    }

    // Heading
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/)
    if (heading) {
      const level = headingLevel(heading[1].length)
      blocks.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`)
      i++
      continue
    }

    // Riga orizzontale
    if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push("<hr>")
      i++
      continue
    }

    // Citazione: raccoglie le righe consecutive che iniziano con ">"
    if (/^\s{0,3}>\s?/.test(line)) {
      const quote: string[] = []
      while (i < lines.length && /^\s{0,3}>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s{0,3}>\s?/, ""))
        i++
      }
      blocks.push(`<blockquote>${markdownToHtml(quote.join("\n"))}</blockquote>`)
      continue
    }

    // Liste
    if (isListLine(line)) {
      const list = parseList(lines, i)
      blocks.push(list.html)
      i = list.next
      continue
    }

    // Paragrafo: righe consecutive fino a una riga vuota o a un blocco
    const paragraph: string[] = []
    while (i < lines.length) {
      const current = lines[i]
      if (!current.trim()) break
      if (/^\s{0,3}#{1,6}\s+/.test(current)) break
      if (/^\s{0,3}>\s?/.test(current)) break
      if (/^\s{0,3}(```|~~~)/.test(current)) break
      if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(current)) break
      if (isListLine(current)) break
      paragraph.push(current.trim())
      i++
    }

    if (paragraph.length) {
      blocks.push(`<p>${renderInline(paragraph.join("\n"))}</p>`)
    } else {
      // nessun progresso possibile: evita loop infiniti
      i++
    }
  }

  return blocks.join("\n")
}

// ---------------------------------------------------------------------------
// HTML → testo semplice
// ---------------------------------------------------------------------------

/** Riduce un frammento HTML a testo semplice conservando i confini di blocco. */
export function htmlToPlainText(html: string): string {
  if (!html) return ""

  if (typeof DOMParser === "undefined") {
    // fallback senza DOM (SSR/test in ambienti minimali)
    return decodeHtml(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""))
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }

  const doc = new DOMParser().parseFromString(html, "text/html")
  const parts: string[] = []

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.textContent ?? "")
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const element = node as Element
    const tag = element.tagName.toLowerCase()

    if (tag === "br") {
      parts.push("\n")
      return
    }
    if (tag === "li") {
      const text = element.textContent?.trim() ?? ""
      parts.push(`\n- ${text}`)
      return
    }

    const isBlock = BLOCK_TAGS.has(tag)
    if (isBlock) parts.push("\n\n")
    for (const child of Array.from(element.childNodes)) walk(child)
    if (isBlock) parts.push("\n\n")
  }

  walk(doc.body)

  return parts
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** Converte testo semplice in paragrafi HTML (righe singole = <br>). */
export function textToHtml(text: string): string {
  if (!text || !text.trim()) return ""
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("\n")
}

// ---------------------------------------------------------------------------
// Sanitizzazione
// ---------------------------------------------------------------------------

function cleanChildren(node: Node, doc: Document): DocumentFragment {
  const fragment = doc.createDocumentFragment()

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      fragment.appendChild(doc.createTextNode(child.textContent ?? ""))
      continue
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue

    const element = child as Element
    const tag = element.tagName.toLowerCase()

    if (DROP_TAGS.has(tag)) continue

    // Tag non previsti: si tiene il contenuto, si scarta il tag
    if (!ALLOWED_TAGS.has(tag)) {
      fragment.appendChild(cleanChildren(element, doc))
      continue
    }

    if (tag === "iframe") {
      const src = element.getAttribute("src") ?? ""
      if (!EMBED_HOSTS.test(src)) continue
    }

    const clean = doc.createElement(tag)

    const allowedAttrs = new Set([...(TAG_ATTRS[tag] ?? []), ...GLOBAL_ATTRS])
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase()
      if (!allowedAttrs.has(name)) continue
      if (name.startsWith("on")) continue

      if (name === "href" || name === "src") {
        if (!isSafeUrl(attr.value)) continue
      }
      clean.setAttribute(name, attr.value)
    }

    if (tag === "img") {
      if (!clean.getAttribute("src")) continue
      if (!clean.getAttribute("alt")) clean.setAttribute("alt", "")
      if (!clean.getAttribute("loading")) clean.setAttribute("loading", "lazy")
      if (!clean.getAttribute("decoding")) clean.setAttribute("decoding", "async")
    }

    if (tag === "a") {
      const href = clean.getAttribute("href")
      if (href && /^https?:/i.test(href)) {
        clean.setAttribute("rel", "noopener noreferrer")
        if (!clean.getAttribute("target")) clean.setAttribute("target", "_blank")
      }
    }

    clean.appendChild(cleanChildren(element, doc))
    fragment.appendChild(clean)
  }

  return fragment
}

/** Ripulisce l'HTML con una allowlist di tag/attributi (difesa da XSS). */
export function sanitizeHtml(html: string): string {
  if (!html || !html.trim()) return ""

  if (typeof DOMParser === "undefined") {
    return html
      .replace(/<(script|style|iframe|object|embed|form)[\s\S]*?<\/\1>/gi, "")
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript:/gi, "")
  }

  const doc = new DOMParser().parseFromString(html, "text/html")
  const container = doc.createElement("div")
  container.appendChild(cleanChildren(doc.body, doc))

  // I paragrafi vuoti prodotti da contenteditable non servono
  container.querySelectorAll("p").forEach((paragraph) => {
    const text = paragraph.textContent?.trim() ?? ""
    if (!text && !paragraph.querySelector("img, iframe, video, br, a")) paragraph.remove()
  })

  return container.innerHTML
}

// ---------------------------------------------------------------------------
// Punto di ingresso usato dall'editor
// ---------------------------------------------------------------------------

/** `true` se l'HTML contiene già formattazione "ricca" (heading, liste, link…). */
function hasRichFormatting(html: string): boolean {
  return /<\/?(h[1-6]|ul|ol|li|blockquote|table|pre|code|strong|em|b|i|a|img|iframe)\b/i.test(html)
}

/**
 * Normalizza il contenuto incollato/scritto nell'editor.
 *
 * - HTML → sanitizzato;
 * - Markdown → convertito e poi sanitizzato;
 * - testo semplice → paragrafi.
 *
 * Gestisce anche il caso in cui il Markdown sia finito dentro un contenitore
 * HTML (tipico di `contenteditable`: `<div>## Titolo</div>`).
 */
export function formatContent(raw: string): string {
  const input = (raw ?? "").trim()
  if (!input) return ""

  const plainText = htmlToPlainText(input)
  const rich = hasRichFormatting(input)

  // Markdown "annegato" in un contenitore HTML senza formattazione reale
  if (!rich && looksLikeMarkdown(plainText)) {
    return sanitizeHtml(markdownToHtml(plainText))
  }

  if (looksLikeHtml(input)) {
    const decoded = ESCAPED_HTML_RE.test(input) && !HTML_TAG_RE.test(input) ? decodeHtml(input) : input
    return sanitizeHtml(decoded)
  }

  if (looksLikeMarkdown(input)) {
    return sanitizeHtml(markdownToHtml(input))
  }

  return textToHtml(input)
}

/** Riduce il contenuto a testo semplice e lo rimette in paragrafi (pulsante "Pulisci"). */
export function clearFormatting(raw: string): string {
  return textToHtml(htmlToPlainText(raw))
}
