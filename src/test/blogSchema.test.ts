import { describe, it, expect } from "vitest"

import type { Post } from "../api/blogApi"
import {
  SITE_URL,
  postUrl,
  buildArticleSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
  postBreadcrumb,
  buildBlogIndexSchema,
  serializeSchemas,
} from "../lib/blogSchema"

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    _id: "abc123",
    title: "Arredamento barbieri a Caserta e Macerata Campania",
    slug: "arredamento-barbieri-caserta",
    sectorSlug: "barbieri",
    excerpt: "Guida all'arredo su misura per saloni barbieri.",
    content: "<h2>Guida</h2><p>Testo.</p>",
    author: { name: "Farcom Arredi", role: "Redazione" },
    publishedAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-10T10:00:00.000Z",
    tags: [],
    faq: [],
    internalLinks: [],
    featured: false,
    order: 0,
    isPublished: true,
    ...overrides,
  }
}

describe("postUrl", () => {
  it("costruisce l'URL assoluto dell'articolo", () => {
    expect(postUrl("mio-articolo")).toBe(`${SITE_URL}/blog/mio-articolo`)
  })
})

describe("buildArticleSchema — Schema.org Article", () => {
  it("produce uno schema Article completo", () => {
    const schema = buildArticleSchema(makePost())

    expect(schema["@context"]).toBe("https://schema.org")
    expect(schema["@type"]).toBe("Article")
    expect(schema.headline).toBe("Arredamento barbieri a Caserta e Macerata Campania")
    expect(schema.inLanguage).toBe("it-IT")
    expect(schema.datePublished).toBe("2026-02-01T10:00:00.000Z")
    expect(schema.dateModified).toBe("2026-02-10T10:00:00.000Z")
    expect((schema.mainEntityOfPage as { "@id": string })["@id"]).toBe(postUrl("arredamento-barbieri-caserta"))
  })

  it("usa la meta description e, in sua assenza, l'estratto", () => {
    expect(buildArticleSchema(makePost({ seoDescription: "Descrizione SEO" })).description).toBe(
      "Descrizione SEO"
    )
    expect(buildArticleSchema(makePost()).description).toBe("Guida all'arredo su misura per saloni barbieri.")
  })

  it("include autore e publisher come organizzazione", () => {
    const schema = buildArticleSchema(makePost())

    expect((schema.author as { name: string }).name).toBe("Farcom Arredi")
    expect((schema.publisher as { name: string }).name).toBe("Farcom S.r.l.")
    expect((schema.publisher as { logo: { url: string } }).logo.url).toContain("logo.png")
  })

  it("preferisce la copertina Open Graph come immagine", () => {
    expect(buildArticleSchema(makePost({ coverImage: "https://cdn/cover.jpg" })).image).toEqual([
      "https://cdn/cover.jpg",
    ])
    expect(
      buildArticleSchema(makePost({ coverImage: "https://cdn/cover.jpg", ogImage: "https://cdn/og.jpg" })).image
    ).toEqual(["https://cdn/og.jpg"])
  })

  it("omette l'immagine quando non ce n'è", () => {
    expect(buildArticleSchema(makePost()).image).toBeUndefined()
  })
})

describe("buildFaqSchema — Schema.org FAQPage", () => {
  it("ritorna null quando non ci sono FAQ", () => {
    expect(buildFaqSchema(makePost())).toBeNull()
    expect(buildFaqSchema(makePost({ faq: [] }))).toBeNull()
  })

  it("ignora le domande incomplete", () => {
    expect(
      buildFaqSchema(
        makePost({ faq: [{ question: "", answer: "" }, { question: "  ", answer: "" }] })
      )
    ).toBeNull()
  })

  it("produce uno schema FAQPage con domande e risposte", () => {
    const schema = buildFaqSchema(
      makePost({
        faq: [
          { question: "Quanto costa?", answer: "Dipende dai metri quadri." },
          { question: "Quanto tempo serve?", answer: "Circa quattro settimane." },
        ],
      })
    )

    expect(schema?.["@type"]).toBe("FAQPage")
    const entities = schema?.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>
    expect(entities).toHaveLength(2)
    expect(entities[0].name).toBe("Quanto costa?")
    expect(entities[0].acceptedAnswer.text).toBe("Dipende dai metri quadri.")
    expect(entities[1].acceptedAnswer.text).toBe("Circa quattro settimane.")
  })
})

describe("buildBreadcrumbSchema — Schema.org BreadcrumbList", () => {
  it("numera i nodi partendo da 1", () => {
    const schema = buildBreadcrumbSchema([
      { name: "Home", item: `${SITE_URL}/` },
      { name: "Blog", item: `${SITE_URL}/blog` },
      { name: "Titolo articolo" },
    ])

    expect(schema["@type"]).toBe("BreadcrumbList")
    const items = schema.itemListElement as Array<{ position: number; name: string; item?: string }>
    expect(items.map((item) => item.position)).toEqual([1, 2, 3])
    expect(items[0].item).toBe(`${SITE_URL}/`)
    expect(items[2].item).toBeUndefined()
  })

  it("costruisce il breadcrumb dell'articolo", () => {
    const entries = postBreadcrumb(makePost())

    expect(entries).toHaveLength(3)
    expect(entries[0]).toEqual({ name: "Home", item: `${SITE_URL}/` })
    expect(entries[1]).toEqual({ name: "Blog", item: `${SITE_URL}/blog` })
    expect(entries[2].name).toBe("Arredamento barbieri a Caserta e Macerata Campania")
  })
})

describe("buildBlogIndexSchema", () => {
  it("descrive l'indice del blog", () => {
    const schema = buildBlogIndexSchema()

    expect(schema["@type"]).toBe("Blog")
    expect(schema.name).toBe("Blog Farcom Arredi")
    expect(schema.url).toBe(`${SITE_URL}/blog`)
    expect(schema.inLanguage).toBe("it-IT")
  })
})

describe("serializeSchemas", () => {
  it("elimina gli elementi nulli e serializza un array di schemi", () => {
    const serialized = serializeSchemas([{ "@type": "Article" }, null, { "@type": "FAQPage" }])

    expect(JSON.parse(serialized)).toEqual([{ "@type": "Article" }, { "@type": "FAQPage" }])
  })

  it("protegge da script injection nei contenuti inseriti dall'admin", () => {
    const serialized = serializeSchemas([{ "@type": "Article", headline: "</script>" }])

    expect(serialized).not.toContain("</script>")
    expect(serialized).toContain("\\u003c")
  })
})
