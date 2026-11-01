import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import PostForm from "../components/admin/blog/PostForm"
import type { Post } from "../api/blogApi"

const mocks = vi.hoisted(() => ({
  createPost: vi.fn(async () => ({})),
  updatePost: vi.fn(async () => ({})),
}))

vi.mock("../api/blogApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/blogApi")>()
  return { ...actual, createPost: mocks.createPost, updatePost: mocks.updatePost }
})

// Il form monta l'uploader immagini, che richiede il provider di autenticazione
vi.mock("../hooks/useAdminAuth", () => ({
  useAdminAuth: () => ({ isAuthenticated: true }),
}))

// L'editor WYSIWYG usa contenteditable: nei test basta un textarea controllato
vi.mock("../components/admin/blog/PostEditor", () => ({
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      aria-label="Contenuto completo"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

function renderForm(post: Post | null = null) {
  return render(
    <MemoryRouter>
      <PostForm post={post} />
    </MemoryRouter>
  )
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/^Titolo/), {
    target: { value: "Arredo per ristoranti" },
  })
  fireEvent.change(screen.getByLabelText(/Estratto breve/), {
    target: { value: "Estratto di prova per il nuovo articolo." },
  })
  fireEvent.change(screen.getByLabelText("Contenuto completo"), {
    target: { value: "Testo dell'articolo." },
  })
}

function sectorSelect(): HTMLSelectElement {
  return screen.getByLabelText(/Categoria \/ settore/) as HTMLSelectElement
}

const customSectorInput = () => screen.queryByLabelText(/Inserisci categoria\/settore personalizzata/)

function publishedPost(): Post {
  return {
    _id: "post-1",
    title: "Articolo esistente",
    slug: "articolo-esistente",
    sectorSlug: "Hotel e B&B",
    excerpt: "Estratto esistente.",
    content: "<p>Testo esistente</p>",
    author: { name: "Redazione", role: "Redazione" },
    tags: [],
    faq: [],
    internalLinks: [],
    isPublished: true,
    featured: false,
    publishedAt: "2026-01-01T00:00:00.000Z",
  } as unknown as Post
}

beforeEach(() => {
  mocks.createPost.mockClear()
  mocks.updatePost.mockClear()
})

describe("PostForm — categoria personalizzata (Altro)", () => {
  it("mostra il campo di testo solo quando si seleziona Altro", () => {
    renderForm()

    expect(customSectorInput()).toBeNull()

    fireEvent.change(sectorSelect(), { target: { value: "__altro__" } })
    expect(customSectorInput()).toBeInTheDocument()

    fireEvent.change(sectorSelect(), { target: { value: "negozi" } })
    expect(customSectorInput()).toBeNull()
  })

  it("blocca il salvataggio se Altro è selezionato e il campo è vuoto", async () => {
    renderForm()
    fillRequiredFields()

    fireEvent.change(sectorSelect(), { target: { value: "__altro__" } })
    fireEvent.click(screen.getByRole("button", { name: "Crea articolo" }))

    expect(
      await screen.findByText("Inserisci una categoria/settore personalizzata.")
    ).toBeInTheDocument()
    expect(mocks.createPost).not.toHaveBeenCalled()
  })

  it("salva la categoria scritta a mano al posto di Altro", async () => {
    renderForm()
    fillRequiredFields()

    fireEvent.change(sectorSelect(), { target: { value: "__altro__" } })
    fireEvent.change(customSectorInput() as HTMLElement, { target: { value: "Ristoranti" } })
    fireEvent.click(screen.getByRole("button", { name: "Crea articolo" }))

    await waitFor(() => expect(mocks.createPost).toHaveBeenCalledTimes(1))
    const payload = mocks.createPost.mock.calls[0][0] as { sectorSlug: string }
    expect(payload.sectorSlug).toBe("Ristoranti")
  })

  it("salva normalmente una categoria già esistente", async () => {
    renderForm()
    fillRequiredFields()

    fireEvent.change(sectorSelect(), { target: { value: "negozi" } })
    fireEvent.click(screen.getByRole("button", { name: "Crea articolo" }))

    await waitFor(() => expect(mocks.createPost).toHaveBeenCalledTimes(1))
    const payload = mocks.createPost.mock.calls[0][0] as { sectorSlug: string }
    expect(payload.sectorSlug).toBe("negozi")
  })

  it("riapre un articolo con categoria personalizzata in modalità Altro", () => {
    renderForm(publishedPost())

    expect(sectorSelect().value).toBe("__altro__")
    expect(customSectorInput()).toHaveValue("Hotel e B&B")
  })
})
