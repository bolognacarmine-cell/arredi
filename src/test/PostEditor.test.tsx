import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { useState } from "react"

import PostEditor from "../components/admin/blog/PostEditor"

/** Wrapper controllato: riproduce il comportamento di PostForm. */
function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <div>
      <PostEditor value={value} onChange={setValue} />
      <output data-testid="value">{value}</output>
    </div>
  )
}

function editorBox(): HTMLElement {
  return screen.getByRole("textbox", { name: /Contenuto completo/i })
}

function currentValue(): string {
  return screen.getByTestId("value").textContent ?? ""
}

function paste(data: { html?: string; text?: string }) {
  fireEvent.paste(editorBox(), {
    clipboardData: {
      getData: (type: string) =>
        type === "text/html" ? data.html ?? "" : type === "text/plain" ? data.text ?? "" : "",
    },
  })
}

let execSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  // jsdom non implementa execCommand: simuliamo insertHTML/insertText
  execSpy = vi.fn((command: string, _show: boolean, argument?: string) => {
    if (command === "insertHTML" && typeof argument === "string") {
      const editor = document.querySelector<HTMLElement>('[aria-label="Contenuto completo dell\'articolo"]')
      if (editor) {
        editor.innerHTML = argument
        editor.dispatchEvent(new Event("input", { bubbles: true }))
      }
    }
    return true
  })
  ;(document as unknown as { execCommand: unknown }).execCommand = execSpy
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("PostEditor — incolla Markdown", () => {
  it("converte il Markdown incollato come testo semplice", () => {
    render(<Harness />)

    paste({ text: "## Titolo\n\n**forte** e *corsivo*\n\n- voce" })

    expect(execSpy).toHaveBeenCalledWith("insertHTML", false, expect.stringContaining("<h2>Titolo</h2>"))
    expect(currentValue()).toContain("<strong>forte</strong>")
    expect(currentValue()).toContain("<em>corsivo</em>")
    expect(currentValue()).toContain("<ul><li>voce</li></ul>")
    expect(currentValue()).not.toContain("##")
  })

  it("converte il Markdown rimasto dentro i div di contenteditable", () => {
    render(<Harness />)

    paste({ html: "<div>## Titolo</div><div>- voce</div>" })

    expect(currentValue()).toContain("<h2>Titolo</h2>")
    expect(currentValue()).toContain("<ul><li>voce</li></ul>")
  })

  it("interpreta l'HTML incollato e rimuove gli script", () => {
    render(<Harness />)

    paste({ html: "<h2>Da HTML</h2><script>alert(1)</script><p onclick=\"x()\">Testo</p>" })

    expect(currentValue()).toContain("<h2>Da HTML</h2>")
    expect(currentValue()).toContain("<p>Testo</p>")
    expect(currentValue()).not.toContain("<script")
    expect(currentValue()).not.toContain("onclick")
  })

  it("lascia il testo semplice al comportamento nativo", () => {
    render(<Harness />)

    paste({ text: "Solo una frase senza formattazione." })

    expect(execSpy).toHaveBeenCalledWith("insertText", false, "Solo una frase senza formattazione.")
  })
})

describe("PostEditor — pulsanti", () => {
  it("Formatta automaticamente converte il contenuto Markdown", () => {
    render(<Harness initial={"## Titolo\n\n- voce"} />)

    fireEvent.click(screen.getByRole("button", { name: /Formatta automaticamente/i }))

    expect(currentValue()).toBe("<h2>Titolo</h2>\n<ul><li>voce</li></ul>")
  })

  it("Formatta automaticamente ripulisce l'HTML già valido", () => {
    render(<Harness initial={'<h2>Titolo</h2><p style="color:red">Testo</p>'} />)

    fireEvent.click(screen.getByRole("button", { name: /Formatta automaticamente/i }))

    expect(currentValue()).toBe("<h2>Titolo</h2><p>Testo</p>")
  })

  it("Pulisci formattazione rimuove titoli e grassetti dopo la conferma", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true)
    render(<Harness initial="<h2>Titolo</h2><p>Testo <strong>forte</strong></p>" />)

    fireEvent.click(screen.getByRole("button", { name: /Pulisci formattazione/i }))

    expect(window.confirm).toHaveBeenCalled()
    expect(currentValue()).not.toContain("<h2>")
    expect(currentValue()).not.toContain("<strong>")
    expect(currentValue()).toContain("Testo forte")
  })

  it("Pulisci formattazione non tocca il contenuto se l'utente annulla", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false)
    const initial = "<h2>Titolo</h2><p>Testo</p>"
    render(<Harness initial={initial} />)

    fireEvent.click(screen.getByRole("button", { name: /Pulisci formattazione/i }))

    expect(currentValue()).toBe(initial)
  })
})

describe("PostEditor — anteprima live", () => {
  it("mostra titoli, paragrafi, elenchi, link e grassetto formattati", () => {
    render(
      <Harness
        initial={"## Sezione\n\nTesto con **grassetto** e [link](/settori).\n\n- primo\n- secondo"}
      />
    )

    expect(screen.getByRole("heading", { level: 2, name: "Sezione" })).toBeInTheDocument()
    expect(screen.getByText("grassetto").tagName).toBe("STRONG")
    expect(screen.getByRole("link", { name: "link" })).toHaveAttribute("href", "/settori")

    const items = screen.getAllByRole("listitem")
    expect(items.map((item) => item.textContent)).toEqual(["primo", "secondo"])
  })

  it("formatta l'anteprima anche se il Markdown non è ancora convertito", () => {
    render(<Harness initial="### Sottotitolo" />)

    expect(screen.getByRole("heading", { level: 3, name: "Sottotitolo" })).toBeInTheDocument()
  })

  it("si può nascondere", () => {
    render(<Harness initial={"## Sezione"} />)

    fireEvent.click(screen.getByRole("button", { name: /Nascondi anteprima/i }))

    expect(screen.queryByRole("heading", { level: 2, name: "Sezione" })).not.toBeInTheDocument()
  })

  it("mostra un segnaposto quando il contenuto è vuoto", () => {
    render(<Harness />)

    expect(screen.getByText(/L'anteprima dell'articolo formattato apparirà qui/i)).toBeInTheDocument()
  })
})
