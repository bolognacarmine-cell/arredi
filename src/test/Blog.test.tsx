import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"

import Blog from "../pages/Blog"
import BlogCard, { BlogCardSkeleton } from "../components/blog/BlogCard"
import { normalizePost, type Post } from "../api/blogApi"
import staticPosts from "../data/blogPosts.json"

const TOTAL_STATIC_POSTS = (staticPosts as unknown as Array<{ isPublished?: boolean }>).filter(
  (post) => post.isPublished
).length

function renderBlog() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/blog"]}>
        <Blog />
      </MemoryRouter>
    </HelmetProvider>
  )
}

function renderCard(post: Post, props: { eager?: boolean; compact?: boolean } = {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <BlogCard post={post} sectorLabel="Barbieri e parrucchieri" {...props} />
      </MemoryRouter>
    </HelmetProvider>
  )
}

const rawBarber = (staticPosts as unknown as Array<Record<string, unknown>>).find(
  (post) => post.sectorSlug === "barbieri"
) as Record<string, unknown>

describe("Pagina /blog — struttura", () => {
  it("mostra l'H1 richiesto e il sottotitolo", async () => {
    renderBlog()

    const heading = await screen.findByRole("heading", { level: 1, name: "Blog Farcom Arredi" })
    expect(heading).toBeInTheDocument()
    expect(screen.getByText(/progettazione interni per barbieri/i)).toBeInTheDocument()
  })

  it("renderizza una card per ogni articolo pubblicato", async () => {
    renderBlog()

    const cards = await screen.findAllByRole("link", { name: /Leggi l'articolo/ })
    expect(cards).toHaveLength(TOTAL_STATIC_POSTS)
    expect(cards[0]).toHaveAttribute("href", expect.stringMatching(/^\/blog\//))
  })

  it("mostra titolo, settore, estratto e data in ogni card", async () => {
    renderBlog()

    await screen.findAllByRole("link", { name: /Leggi l'articolo/ })

    expect(
      screen.getByRole("heading", { level: 3, name: rawBarber.title as string })
    ).toBeInTheDocument()
    expect(screen.getAllByText("Barbieri e parrucchieri").length).toBeGreaterThan(0)
    expect(screen.getAllByText(/\d{2} \w+ \d{4}/).length).toBeGreaterThan(0)
  })

  it("offre i filtri per settore richiesti", async () => {
    renderBlog()

    await screen.findAllByRole("link", { name: /Leggi l'articolo/ })

    expect(screen.getByRole("button", { name: "Tutti" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Barbieri e parrucchieri" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Uffici" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Negozi" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Scuole" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Bar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Centri estetici" })).toBeInTheDocument()
  })

  it("espone il campo di ricerca", async () => {
    renderBlog()

    await screen.findAllByRole("link", { name: /Leggi l'articolo/ })

    const search = screen.getByLabelText("Cerca nel blog")
    expect(search).toHaveAttribute("type", "search")
  })

  it("usa una griglia 3 colonne desktop / 2 tablet / 1 mobile", async () => {
    const { container } = renderBlog()

    await screen.findAllByRole("link", { name: /Leggi l'articolo/ })

    const grid = container.querySelector('div[class*="lg:grid-cols-3"]')
    expect(grid).not.toBeNull()
    expect(grid?.className).toContain("grid-cols-1")
    expect(grid?.className).toContain("sm:grid-cols-2")
    expect(grid?.className).toContain("lg:grid-cols-3")
  })

  it("collega la CTA a preventivo e contatti", async () => {
    renderBlog()

    await screen.findAllByRole("link", { name: /Leggi l'articolo/ })

    expect(screen.getByRole("link", { name: "Richiedi un preventivo" })).toHaveAttribute(
      "href",
      "/preventivo"
    )
    expect(screen.getByRole("link", { name: "Contattaci" })).toHaveAttribute("href", "/contatti")
  })
})

describe("Pagina /blog — SEO", () => {
  it("imposta canonical, Open Graph e JSON-LD", async () => {
    renderBlog()

    await screen.findAllByRole("link", { name: /Leggi l'articolo/ })

    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://www.farcomarredi.it/blog"
    )
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute("content")).toBe("website")

    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
      (script) => JSON.parse(script.textContent || "{}")
    )
    expect(schemas.some((schema) => schema["@type"] === "Blog")).toBe(true)
    expect(schemas.some((schema) => schema["@type"] === "BreadcrumbList")).toBe(true)
  })
})

describe("Pagina /blog — filtri e stati", () => {
  it("filtra gli articoli quando si sceglie un settore", async () => {
    renderBlog()

    await screen.findAllByRole("link", { name: /Leggi l'articolo/ })

    fireEvent.click(screen.getByRole("button", { name: "Negozi" }))

    await screen.findByRole("heading", { level: 3, name: /negozi/i })
    expect(screen.getAllByRole("link", { name: /Leggi l'articolo/ })).toHaveLength(1)
  })

  it("filtra per keyword dopo il debounce della ricerca", async () => {
    renderBlog()

    await screen.findAllByRole("link", { name: /Leggi l'articolo/ })

    vi.useFakeTimers()
    try {
      fireEvent.change(screen.getByLabelText("Cerca nel blog"), { target: { value: "uffici" } })
      await act(async () => {
        vi.advanceTimersByTime(500)
      })
    } finally {
      vi.useRealTimers()
    }

    expect(screen.getAllByRole("link", { name: /Leggi l'articolo/ })).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 3, name: /uffici/i })).toBeInTheDocument()
  })

  it("mostra lo stato vuoto con possibilità di azzerare i filtri", async () => {
    renderBlog()

    await screen.findAllByRole("link", { name: /Leggi l'articolo/ })

    vi.useFakeTimers()
    try {
      fireEvent.change(screen.getByLabelText("Cerca nel blog"), {
        target: { value: "keywordinesistente" },
      })
      await act(async () => {
        vi.advanceTimersByTime(500)
      })
    } finally {
      vi.useRealTimers()
    }

    expect(screen.getByText("Nessun articolo trovato")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Azzera i filtri" }))
    const cards = await screen.findAllByRole("link", { name: /Leggi l'articolo/ })
    expect(cards).toHaveLength(TOTAL_STATIC_POSTS)
  })
})

describe("BlogCard", () => {
  it("mostra il badge Novità per gli articoli recenti", () => {
    const recent = normalizePost({
      ...rawBarber,
      publishedAt: new Date().toISOString(),
      coverImageAlt: "Bancone barbiere in noce",
    })

    renderCard(recent)

    expect(screen.getByText("Novità")).toBeInTheDocument()
  })

  it("non mostra il badge per gli articoli datati", () => {
    renderCard(normalizePost(rawBarber))

    expect(screen.queryByText("Novità")).not.toBeInTheDocument()
  })

  it("usa l'alt text della copertina quando presente", () => {
    renderCard(normalizePost({ ...rawBarber, coverImageAlt: "Specchiere retroilluminate" }))

    expect(screen.getByAltText("Specchiere retroilluminate")).toBeInTheDocument()
  })

  it("usa il titolo come alt text quando la copertina non ha descrizione", () => {
    renderCard(normalizePost({ ...rawBarber, coverImageAlt: undefined }))

    expect(screen.getByAltText(rawBarber.title as string)).toBeInTheDocument()
  })

  it("dichiara dimensioni e lazy loading per evitare CLS", () => {
    const { container } = renderCard(normalizePost(rawBarber))

    const image = container.querySelector("img")
    expect(image).toHaveAttribute("width", "1600")
    expect(image).toHaveAttribute("height", "1000")
    expect(image).toHaveAttribute("loading", "lazy")
  })

  it("carica in eager la prima card della pagina (LCP)", () => {
    const { container } = renderCard(normalizePost(rawBarber), { eager: true })

    expect(container.querySelector("img")).toHaveAttribute("loading", "eager")
    expect(container.querySelector("img")).toHaveAttribute("fetchpriority", "high")
  })

  it("renderizza il minuti di lettura", () => {
    renderCard(normalizePost(rawBarber))

    expect(screen.getByText(/min di lettura/)).toBeInTheDocument()
  })

  it("mostra lo skeleton durante il caricamento", () => {
    const { container } = render(<BlogCardSkeleton />)

    expect(container.firstElementChild).toHaveClass("animate-pulse")
  })
})
