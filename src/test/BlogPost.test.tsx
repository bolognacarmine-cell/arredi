import { describe, it, expect } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"

import BlogPost from "../pages/BlogPost"
import staticPosts from "../data/blogPosts.json"

const posts = staticPosts as unknown as Array<Record<string, unknown>>
const barber = posts.find((post) => post.sectorSlug === "barbieri") as Record<string, unknown>

function renderPost(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/blog/${slug}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
}

function jsonLdSchemas(): Array<Record<string, unknown>> {
  return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((script) =>
    JSON.parse(script.textContent || "{}")
  )
}

describe("Pagina articolo — contenuto", () => {
  it("mostra H1, data, settore e tempo di lettura", async () => {
    renderPost(barber.slug as string)

    expect(
      await screen.findByRole("heading", { level: 1, name: barber.title as string })
    ).toBeInTheDocument()

    expect(screen.getByText("Barbieri e parrucchieri")).toBeInTheDocument()
    expect(screen.getByText(/min di lettura/)).toBeInTheDocument()
    expect(screen.getByText("Team Arredi")).toBeInTheDocument()
  })

  it("mostra il breadcrumb Home > Blog > titolo", async () => {
    renderPost(barber.slug as string)

    await screen.findByRole("heading", { level: 1, name: barber.title as string })

    const breadcrumb = screen.getByRole("navigation", { name: /percorso di navigazione/i })

    expect(within(breadcrumb).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/")
    expect(within(breadcrumb).getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog")
    expect(within(breadcrumb).getByText(barber.title as string)).toHaveAttribute("aria-current", "page")
  })

  it("renderizza il contenuto HTML dell'articolo", async () => {
    renderPost(barber.slug as string)

    await screen.findByRole("heading", { level: 1, name: barber.title as string })

    const content = document.querySelector(".blog-content")
    expect(content).not.toBeNull()
    expect(content?.querySelector("h2")).not.toBeNull()
  })

  it("collega la pagina settore quando non ci sono link interni", async () => {
    renderPost(barber.slug as string)

    await screen.findByRole("heading", { level: 1, name: barber.title as string })

    expect(screen.getByRole("link", { name: /Arredi su misura per Barbieri e parrucchieri/ })).toHaveAttribute(
      "href",
      "/settori/barbieri"
    )
  })

  it("mostra la CTA finale verso preventivo e contatti", async () => {
    renderPost(barber.slug as string)

    await screen.findByRole("heading", { level: 1, name: barber.title as string })

    expect(screen.getByRole("link", { name: "Richiedi un preventivo" })).toHaveAttribute(
      "href",
      "/preventivo"
    )
    expect(screen.getByRole("link", { name: "Contatta Farcom Arredi" })).toHaveAttribute(
      "href",
      "/contatti"
    )
  })

  it("mostra i tag come link alla ricerca del blog", async () => {
    renderPost(barber.slug as string)

    await screen.findByRole("heading", { level: 1, name: barber.title as string })

    const tagLinks = (barber.tags as string[]).map((tag) =>
      screen.getByRole("link", { name: tag })
    )
    expect(tagLinks).toHaveLength((barber.tags as string[]).length)
    expect(tagLinks[0]).toHaveAttribute("href", expect.stringContaining("/blog?tag="))
  })

  it("mostra la copertina con alt text", async () => {
    const { container } = renderPost(barber.slug as string)

    await screen.findByRole("heading", { level: 1, name: barber.title as string })

    const cover = container.querySelector("img")
    expect(cover).toHaveAttribute("src", barber.coverImage as string)
    // L'admin può impostare un alt dedicato; se manca si usa "titolo — Farcom Arredi"
    expect(cover?.getAttribute("alt")).toContain(barber.title as string)
  })

  it("mostra la sezione FAQ quando l'articolo ha domande", async () => {
    // I dati statici non hanno FAQ: la sezione non deve comparire
    renderPost(barber.slug as string)

    await screen.findByRole("heading", { level: 1, name: barber.title as string })

    expect(screen.queryByRole("heading", { name: "Domande frequenti" })).not.toBeInTheDocument()
  })
})

describe("Pagina articolo — SEO", () => {
  it("emette canonical, Open Graph tipo articolo e Twitter Card", async () => {
    renderPost(barber.slug as string)

    await screen.findByRole("heading", { level: 1, name: barber.title as string })

    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      `https://www.farcomarredi.it/blog/${barber.slug}`
    )
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute("content")).toBe("article")
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute("content")).toBe(
      barber.coverImage as string
    )
    expect(document.querySelector('meta[name="twitter:card"]')).not.toBeNull()
  })

  it("emette lo schema Article e il BreadcrumbList", async () => {
    renderPost(barber.slug as string)

    await screen.findByRole("heading", { level: 1, name: barber.title as string })

    const schemas = jsonLdSchemas()

    const article = schemas.find((schema) => schema["@type"] === "Article") as
      | { headline: string; mainEntityOfPage: { "@id": string }; publisher: { name: string } }
      | undefined
    expect(article).toBeDefined()
    expect(article?.headline).toBe(barber.title as string)
    expect(article?.mainEntityOfPage["@id"]).toBe(`https://www.farcomarredi.it/blog/${barber.slug}`)
    expect(article?.publisher.name).toBe("Farcom S.r.l.")

    const breadcrumb = schemas.find((schema) => schema["@type"] === "BreadcrumbList") as
      | { itemListElement: Array<{ position: number; name: string }> }
      | undefined
    expect(breadcrumb).toBeDefined()
    expect(breadcrumb?.itemListElement).toHaveLength(3)
    expect(breadcrumb?.itemListElement[2].name).toBe(barber.title as string)
  })

  it("non emette il meta noindex per gli articoli pubblicati", async () => {
    renderPost(barber.slug as string)

    await screen.findByRole("heading", { level: 1, name: barber.title as string })

    const robots = document.querySelector('meta[name="robots"]')

    expect(robots).not.toBeNull()
    expect(robots?.getAttribute("content")).toContain("index")
    expect(robots?.getAttribute("content")).toContain("follow")
    expect(robots?.getAttribute("content")).not.toContain("noindex")
  })

  it("imposta il document.title con la meta title dell'articolo", async () => {
    renderPost(barber.slug as string)

    await screen.findByRole("heading", { level: 1, name: barber.title as string })

    expect(document.title).toBe((barber.seoTitle as string) || (barber.title as string))
  })
})

describe("Pagina articolo — stati", () => {
  it("mostra lo stato 404 per uno slug inesistente", async () => {
    renderPost("articolo-che-non-esiste")

    expect(await screen.findByRole("heading", { name: "Articolo non trovato" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Torna al blog" })).toHaveAttribute("href", "/blog")
  })
})
