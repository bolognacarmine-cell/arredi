import { describe, it, expect } from "vitest"

import {
  looksLikeMarkdown,
  looksLikeHtml,
  markdownToHtml,
  sanitizeHtml,
  htmlToPlainText,
  textToHtml,
  formatContent,
  clearFormatting,
} from "../lib/markdown"

describe("looksLikeMarkdown", () => {
  it("riconosce un articolo con heading e liste", () => {
    const md = `## Arredare un salone\n\n- bancone su misura\n- specchi\n\n### Materiali\n\nUsa **legno** e *ottone*.`
    expect(looksLikeMarkdown(md)).toBe(true)
  })

  it("riconosce una citazione con formattazione inline", () => {
    expect(looksLikeMarkdown("> Il design è **sostanza**")).toBe(true)
  })

  it("riconosce un link markdown", () => {
    expect(looksLikeMarkdown("Vedi [i settori](/settori) per i dettagli")).toBe(true)
  })

  it("non considera Markdown una prosa normale", () => {
    expect(looksLikeMarkdown("Arrediamo negozi e uffici su misura a Caserta.")).toBe(false)
  })

  it("non considera Markdown una frase con un solo asterisco", () => {
    expect(looksLikeMarkdown("Prezzo 10 * 3 euro al metro")).toBe(false)
  })

  it("non considera Markdown un testo vuoto", () => {
    expect(looksLikeMarkdown("")).toBe(false)
  })
})

describe("looksLikeHtml", () => {
  it("riconosce i tag HTML", () => {
    expect(looksLikeHtml("<h2>Titolo</h2><p>Testo</p>")).toBe(true)
  })

  it("riconosce l'HTML con entità escapate", () => {
    expect(looksLikeHtml("&lt;h2&gt;Titolo&lt;/h2&gt;")).toBe(true)
  })

  it("non confonde il Markdown con l'HTML", () => {
    expect(looksLikeHtml("## Titolo\n\n- voce")).toBe(false)
  })
})

describe("markdownToHtml — blocchi", () => {
  it("converte ## in H2, ### in H3, #### in H4", () => {
    const html = markdownToHtml("## Sezione\n\n### Sottosezione\n\n#### Dettaglio")
    expect(html).toContain("<h2>Sezione</h2>")
    expect(html).toContain("<h3>Sottosezione</h3>")
    expect(html).toContain("<h4>Dettaglio</h4>")
  })

  it("porta # a H2 (l'H1 è il titolo dell'articolo)", () => {
    expect(markdownToHtml("# Titolo")).toContain("<h2>Titolo</h2>")
  })

  it("converte le liste puntate", () => {
    const html = markdownToHtml("- primo\n- secondo\n- terzo")
    expect(html).toBe("<ul><li>primo</li><li>secondo</li><li>terzo</li></ul>")
  })

  it("converte le liste numerate", () => {
    const html = markdownToHtml("1. primo\n2. secondo")
    expect(html).toBe("<ol><li>primo</li><li>secondo</li></ol>")
  })

  it("gestisce le liste annidate", () => {
    const html = markdownToHtml("- primo\n  - annidato\n- secondo")
    expect(html).toContain("<ul><li>primo<ul><li>annidato</li></ul></li><li>secondo</li></ul>")
  })

  it("converte le citazioni", () => {
    expect(markdownToHtml("> Una citazione")).toBe("<blockquote><p>Una citazione</p></blockquote>")
  })

  it("converte le righe orizzontali", () => {
    expect(markdownToHtml("---")).toBe("<hr>")
  })

  it("separa i paragrafi sulle righe vuote", () => {
    expect(markdownToHtml("Primo paragrafo.\n\nSecondo paragrafo.")).toBe(
      "<p>Primo paragrafo.</p>\n<p>Secondo paragrafo.</p>"
    )
  })

  it("conserva i blocchi di codice senza interpretarli", () => {
    const html = markdownToHtml("```\nconst x = **non grassetto**\n```")
    expect(html).toContain("<pre><code>")
    expect(html).toContain("**non grassetto**")
    expect(html).not.toContain("<strong>")
  })
})

describe("markdownToHtml — inline", () => {
  it("converte il grassetto", () => {
    expect(markdownToHtml("Testo **importante** qui")).toBe("<p>Testo <strong>importante</strong> qui</p>")
  })

  it("converte il corsivo", () => {
    expect(markdownToHtml("Testo *enfatizzato* qui")).toBe("<p>Testo <em>enfatizzato</em> qui</p>")
  })

  it("converte i link", () => {
    expect(markdownToHtml("Vai su [settori](/settori)")).toBe(
      '<p>Vai su <a href="/settori">settori</a></p>'
    )
  })

  it("aggiunge rel e target ai link esterni", () => {
    const html = markdownToHtml("[Google](https://google.com)")
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it("non crea link con protocolli pericolosi", () => {
    const html = markdownToHtml("[clicca](javascript:alert(1))")
    expect(html).not.toContain("<a")
    expect(html).toContain("clicca")
  })

  it("converte le immagini", () => {
    const html = markdownToHtml("![Salone](/img/salone.jpg)")
    expect(html).toContain('src="/img/salone.jpg"')
    expect(html).toContain('alt="Salone"')
    expect(html).toContain('loading="lazy"')
  })

  it("non interpreta il grassetto dentro il codice inline", () => {
    expect(markdownToHtml("Usa `**x**` nel codice")).toBe("<p>Usa <code>**x**</code> nel codice</p>")
  })

  it("non lascia simboli Markdown nel risultato", () => {
    const html = markdownToHtml("## Titolo\n\n**Grassetto** e *corsivo* con [link](/x)\n\n- voce\n\n> citazione")
    for (const symbol of ["##", "**", "](", "> citazione", "- voce"]) {
      expect(html).not.toContain(symbol)
    }
  })
})

describe("sanitizeHtml", () => {
  it("rimuove script e gestori di evento", () => {
    const html = sanitizeHtml('<p onclick="alert(1)">Testo</p><script>alert(2)</script>')
    expect(html).toBe("<p>Testo</p>")
  })

  it("rimuove gli attributi style e class", () => {
    expect(sanitizeHtml('<p class="x" style="color:red">Testo</p>')).toBe("<p>Testo</p>")
  })

  it("blocca gli URL javascript: nei link", () => {
    const html = sanitizeHtml('<a href="javascript:alert(1)">x</a>')
    expect(html).toBe("<a>x</a>")
  })

  it("tiene i tag ammessi e i loro attributi", () => {
    const html = sanitizeHtml('<h2>Titolo</h2><a href="/settori">settori</a><img src="/a.jpg" alt="A">')
    expect(html).toContain("<h2>Titolo</h2>")
    expect(html).toContain('<a href="/settori">settori</a>')
    expect(html).toContain('<img src="/a.jpg" alt="A" loading="lazy" decoding="async">')
  })

  it("tiene solo gli embed YouTube/Vimeo", () => {
    expect(sanitizeHtml('<iframe src="https://www.youtube.com/embed/abc123"></iframe>')).toContain("<iframe")
    expect(sanitizeHtml('<iframe src="https://evil.example/x"></iframe>')).toBe("")
  })

  it("mantiene il testo dei tag sconosciuti scartando il tag", () => {
    expect(sanitizeHtml("<custom>Testo</custom>")).toBe("Testo")
  })
})

describe("htmlToPlainText", () => {
  it("estrae il testo e conserva i confini di paragrafo", () => {
    const text = htmlToPlainText("<h2>Titolo</h2><p>Primo.</p><p>Secondo.</p>")
    expect(text).toContain("Titolo")
    expect(text).toContain("Primo.")
    expect(text).toContain("Secondo.")
    expect(text).not.toContain("<")
  })

  it("trasforma i <br> in a capo", () => {
    expect(htmlToPlainText("Riga uno<br>Riga due")).toBe("Riga uno\nRiga due")
  })
})

describe("textToHtml", () => {
  it("crea un paragrafo per blocco", () => {
    expect(textToHtml("Primo\n\nSecondo")).toBe("<p>Primo</p>\n<p>Secondo</p>")
  })

  it("esegue l'escape dell'HTML", () => {
    expect(textToHtml("5 < 10 & 20 > 3")).toBe("<p>5 &lt; 10 &amp; 20 &gt; 3</p>")
  })
})

describe("formatContent", () => {
  it("converte un Markdown incollato come testo", () => {
    const html = formatContent("## Titolo\n\n**Grassetto**\n\n- voce")
    expect(html).toContain("<h2>Titolo</h2>")
    expect(html).toContain("<strong>Grassetto</strong>")
    expect(html).toContain("<ul><li>voce</li></ul>")
  })

  it("converte il Markdown finito dentro i div di contenteditable", () => {
    const html = formatContent("<div>## Titolo</div><div>- voce</div>")
    expect(html).toContain("<h2>Titolo</h2>")
    expect(html).toContain("<ul><li>voce</li></ul>")
    expect(html).not.toContain("##")
  })

  it("lascia intatto l'HTML valido, ripulendolo", () => {
    const html = formatContent('<h2>Titolo</h2><p>Testo <strong>forte</strong></p>')
    expect(html).toBe("<h2>Titolo</h2><p>Testo <strong>forte</strong></p>")
  })

  it("interpreta l'HTML incollato come testo escapato", () => {
    const html = formatContent("&lt;h2&gt;Titolo&lt;/h2&gt;&lt;p&gt;Testo&lt;/p&gt;")
    expect(html).toContain("<h2>Titolo</h2>")
    expect(html).toContain("<p>Testo</p>")
  })

  it("trasforma il testo semplice in paragrafi", () => {
    expect(formatContent("Solo testo\n\nSecondo blocco")).toBe("<p>Solo testo</p>\n<p>Secondo blocco</p>")
  })

  it("è idempotente", () => {
    const once = formatContent("## Titolo\n\n- voce\n\n**grassetto**")
    expect(formatContent(once)).toBe(once)
  })

  it("gestisce il contenuto vuoto", () => {
    expect(formatContent("")).toBe("")
    expect(formatContent("   \n  ")).toBe("")
  })
})

describe("clearFormatting", () => {
  it("rimuove titoli, liste e grassetti lasciando il testo", () => {
    const html = clearFormatting("<h2>Titolo</h2><p>Testo <strong>forte</strong></p><ul><li>voce</li></ul>")
    expect(html).not.toContain("<h2>")
    expect(html).not.toContain("<strong>")
    expect(html).not.toContain("<ul>")
    expect(html).toContain("Titolo")
    expect(html).toContain("forte")
    expect(html).toContain("voce")
  })

  it("mantiene i paragrafi", () => {
    const html = clearFormatting("<p>Primo</p><p>Secondo</p>")
    expect(html).toContain("<p>Primo</p>")
    expect(html).toContain("<p>Secondo</p>")
  })
})
