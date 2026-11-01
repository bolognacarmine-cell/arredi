import { describe, it, expect, vi } from "vitest"

import {
  generateSlug,
  estimateReadingMinutes,
  formatPostDate,
  isRecent,
  normalizePost,
  getPosts,
  getPostBySlug,
  type Post,
} from "../api/blogApi"

const rawPost = {
  _id: "abc123",
  title: "Arredamento barbieri a Caserta",
  slug: "arredamento-barbieri-caserta",
  sectorSlug: "barbieri",
  excerpt: "Guida all'arredo su misura per saloni barbieri.",
  content: "<h2>Guida</h2><p>Contenuto dell'articolo.</p>",
  author: { name: "Farcom Arredi", role: "Redazione" },
  publishedAt: "2026-02-01T10:00:00.000Z",
  updatedAt: "2026-02-01T10:00:00.000Z",
  tags: ["barbieri", "Caserta"],
  isPublished: true,
}

describe("generateSlug", () => {
  it("genera uno slug pulito dal titolo", () => {
    expect(generateSlug("Arredamento su misura a Caserta")).toBe("arredamento-misura-caserta")
  })

  it("elimina accenti e caratteri speciali", () => {
    expect(generateSlug("Cucine & Bagni — guida")).toBe("cucine-bagni-guida")
  })

  it("tronca a 60 caratteri senza trattini finali", () => {
    const slug = generateSlug("parole ".repeat(40))
    expect(slug.length).toBeLessThanOrEqual(60)
    expect(slug.endsWith("-")).toBe(false)
  })
})

describe("normalizePost", () => {
  it("aggiunge i campi mancanti ai dati statici/legacy", () => {
    const post = normalizePost(rawPost)

    expect(post.faq).toEqual([])
    expect(post.internalLinks).toEqual([])
    expect(post.images).toEqual([])
    expect(post.featured).toBe(false)
    expect(post.order).toBe(0)
    expect(post.isPublished).toBe(true)
    expect(post.author.name).toBe("Farcom Arredi")
  })

  it("non perde i campi già presenti", () => {
    const post = normalizePost({
      ...rawPost,
      faq: [{ question: "Domanda?", answer: "Risposta." }],
      internalLinks: [{ label: "Barbieri", url: "/settori/barbieri" }],
      featured: true,
      order: 3,
    })

    expect(post.faq).toHaveLength(1)
    expect(post.internalLinks).toHaveLength(1)
    expect(post.featured).toBe(true)
    expect(post.order).toBe(3)
  })

  it("segnala come non pubblicato un dato privo del flag", () => {
    const { isPublished, ...withoutFlag } = rawPost
    expect(normalizePost(withoutFlag as Record<string, unknown>).isPublished).toBe(false)
  })
})

describe("formatPostDate / isRecent", () => {
  it("formatta la data in italiano lungo", () => {
    expect(formatPostDate("2026-02-01T10:00:00.000Z")).toMatch(/\d{2} \w+ 2026/)
  })

  it("ritorna stringa vuota per date non valide", () => {
    expect(formatPostDate("non-una-data")).toBe("")
  })

  it("identifica gli articoli pubblicati da meno di 14 giorni", () => {
    const recent = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    const old = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()

    expect(isRecent(recent)).toBe(true)
    expect(isRecent(old)).toBe(false)
    expect(isRecent("non-una-data")).toBe(false)
  })
})

describe("estimateReadingMinutes", () => {
  it("calcola i minuti di lettura a 200 parole/minuto", () => {
    const words = Array.from({ length: 400 }, (_, i) => `parola${i}`).join(" ")
    expect(estimateReadingMinutes(`<p>${words}</p>`)).toBe(2)
  })

  it("ritorna almeno un minuto", () => {
    expect(estimateReadingMinutes("")).toBe(1)
    expect(estimateReadingMinutes("<p>poco testo</p>")).toBe(1)
  })

  it("ignora i tag HTML e i blocchi di script", () => {
    const withTags = `<div><script>var x = 1</script><p>${"uno ".repeat(200)}</p></div>`
    expect(estimateReadingMinutes(withTags)).toBe(1)
  })
})

describe("getPosts — fallback statico (API non raggiungibile)", () => {
  it("prova l'API e usa i dati statici se la richiesta fallisce", async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>
    const response = await getPosts({ limit: 3 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(response.success).toBe(true)
    expect(response.data.length).toBeLessThanOrEqual(3)
    expect(response.pagination.total).toBe(6)
    expect(response.pagination.totalPages).toBe(2)
  })

  it("filtra per settore", async () => {
    const response = await getPosts({ sectorSlug: "barbieri" })

    expect(response.data.every((post: Post) => post.sectorSlug === "barbieri")).toBe(true)
    expect(response.data.length).toBeGreaterThan(0)
  })

  it("filtra per keyword su titolo, estratto e tag", async () => {
    const response = await getPosts({ search: "negozi" })

    expect(response.data.length).toBeGreaterThan(0)
    response.data.forEach((post) => {
      const haystack = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase()
      expect(haystack).toContain("negozi")
    })
  })

  it("ordina gli articoli per data decrescente", async () => {
    const { data } = await getPosts({ limit: 50 })
    const dates = data.map((post) => new Date(post.publishedAt).getTime())

    expect(dates).toEqual([...dates].sort((a, b) => b - a))
  })
})

describe("getPostBySlug — fallback statico", () => {
  it("ritorna l'articolo pubblicato", async () => {
    const post = await getPostBySlug("arredamento-barbieri-moderno-salone-successo")

    expect(post?.title).toBeTruthy()
    expect(post?.slug).toBe("arredamento-barbieri-moderno-salone-successo")
    expect(post?.faq).toEqual([])
  })

  it("ritorna null per uno slug inesistente", async () => {
    await expect(getPostBySlug("questo-articolo-non-esiste")).resolves.toBeNull()
  })
})
