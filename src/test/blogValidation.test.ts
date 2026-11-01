import { describe, it, expect } from "vitest"

import {
  validatePostForm,
  visibleTextLength,
  hasVisibleContent,
  countMessages,
  LIMITS,
} from "../lib/blogValidation"

const validForm = {
  title: "Arredamento barbieri a Caserta e Macerata Campania",
  slug: "arredamento-barbieri-caserta",
  sectorSlug: "barbieri",
  excerpt:
    "Guida all'arredo su misura per saloni barbieri: layout, illuminazione e materiali.",
  content: "<h2>Guida completa</h2><p>Testo dell'articolo.</p>",
}

describe("validatePostForm — campi obbligatori", () => {
  it("non segnala errori su un form valido", () => {
    const { errors } = validatePostForm(validForm, { isNew: true })
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it("obbliga titolo, slug, settore, estratto e contenuto", () => {
    const { errors } = validatePostForm({}, { isNew: true })

    expect(errors.title).toBe("Il titolo è obbligatorio")
    expect(errors.slug).toBe("Lo slug è obbligatorio")
    expect(errors.sectorSlug).toBe("Seleziona un settore")
    expect(errors.excerpt).toBe("L'estratto è obbligatorio")
    expect(errors.content).toBe("Il contenuto è obbligatorio")
  })

  it("considera vuoto un contenuto composto solo da tag", () => {
    expect(hasVisibleContent("<p><br></p>")).toBe(false)
    expect(hasVisibleContent("<h2>Titolo</h2><p>Testo</p>")).toBe(true)
    expect(visibleTextLength("<p>Ciao mondo</p>")).toBe(10)
  })

  it("rifiuta uno slug con formato non valido", () => {
    const { errors } = validatePostForm({ ...validForm, slug: "Arredamento Barbieri" }, { isNew: true })

    expect(errors.slug).toMatch(/Solo lettere minuscole/)
  })

  it("rifiuta un titolo oltre i 300 caratteri", () => {
    const { errors } = validatePostForm({ ...validForm, title: "a".repeat(301) }, { isNew: true })
    expect(errors.title).toMatch(/Massimo 300/)
  })

  it("rifiuta un estratto oltre i 300 caratteri", () => {
    const { errors } = validatePostForm({ ...validForm, excerpt: "a".repeat(301) }, { isNew: true })
    expect(errors.excerpt).toMatch(/Massimo 300/)
  })

  it("rifiuta uno slug più lungo di 80 caratteri", () => {
    const { errors } = validatePostForm(
      { ...validForm, slug: "a".repeat(LIMITS.slug + 1) },
      { isNew: true }
    )
    expect(errors.slug).toMatch(/Massimo 80/)
  })
})

describe("validatePostForm — meta title e meta description", () => {
  it("segna come ERRORE un meta title oltre i 60 caratteri", () => {
    const { errors } = validatePostForm(
      { ...validForm, seoTitle: "a".repeat(61) },
      { isNew: true }
    )
    expect(errors.seoTitle).toMatch(/61\/60/)
  })

  it("accetta un meta title di 60 caratteri senza errori", () => {
    const { errors } = validatePostForm(
      { ...validForm, seoTitle: "a".repeat(60) },
      { isNew: true }
    )
    expect(errors.seoTitle).toBeUndefined()
  })

  it("avvisa sotto i 140 caratteri della meta description", () => {
    const { warnings, errors } = validatePostForm(
      { ...validForm, seoDescription: "a".repeat(139) },
      { isNew: true }
    )

    expect(errors.seoDescription).toBeUndefined()
    expect(warnings.seoDescription).toMatch(/139\/140/)
  })

  it("avvisa oltre i 155 caratteri (Google tronca il risultato)", () => {
    const { warnings, errors } = validatePostForm(
      { ...validForm, seoDescription: "a".repeat(160) },
      { isNew: true }
    )

    expect(errors.seoDescription).toBeUndefined()
    expect(warnings.seoDescription).toMatch(/155/)
  })

  it("segna come ERRORE una meta description oltre i 160 caratteri", () => {
    const { errors } = validatePostForm(
      { ...validForm, seoDescription: "a".repeat(161) },
      { isNew: true }
    )
    expect(errors.seoDescription).toMatch(/161\/160/)
  })

  it("non segnala errori nel range consigliato 140-155", () => {
    const { errors, warnings } = validatePostForm(
      { ...validForm, seoDescription: "a".repeat(148) },
      { isNew: true }
    )

    expect(Object.keys(errors)).toHaveLength(0)
    expect(warnings.seoDescription).toBeUndefined()
  })
})

describe("validatePostForm — copertina", () => {
  it("avvisa se manca la copertina su un nuovo articolo", () => {
    const { warnings } = validatePostForm(validForm, { isNew: true })
    expect(warnings.coverImage).toMatch(/Copertina consigliata/)
  })

  it("avvisa se la copertina non ha alt text", () => {
    const { warnings } = validatePostForm(
      { ...validForm, coverImage: "https://cdn/x.jpg" },
      { isNew: true }
    )
    expect(warnings.coverImageAlt).toMatch(/alt text/)
  })

  it("rifiuta un alt text oltre i 200 caratteri", () => {
    const { errors } = validatePostForm(
      { ...validForm, coverImage: "https://cdn/x.jpg", coverImageAlt: "a".repeat(201) },
      { isNew: true }
    )
    expect(errors.coverImageAlt).toMatch(/Massimo 200/)
  })

  it("non avvisa sull'alt text quando non c'è copertina", () => {
    const { warnings } = validatePostForm(validForm, { isNew: false })
    expect(warnings.coverImageAlt).toBeUndefined()
  })
})

describe("validatePostForm — URL canonico", () => {
  it("accetta percorsi interni e URL http(s)", () => {
    expect(
      validatePostForm({ ...validForm, canonicalUrl: "/blog/x" }, { isNew: false }).errors
        .canonicalUrl
    ).toBeUndefined()
    expect(
      validatePostForm({ ...validForm, canonicalUrl: "https://x.it" }, { isNew: false }).errors
        .canonicalUrl
    ).toBeUndefined()
  })

  it("rifiuta URL non sicuri", () => {
    const { errors } = validatePostForm(
      { ...validForm, canonicalUrl: "javascript:alert(1)" },
      { isNew: false }
    )
    expect(errors.canonicalUrl).toMatch(/percorso interno/)
  })
})

describe("validatePostForm — FAQ e link interni", () => {
  it("obbliga domanda e risposta per ogni FAQ compilata", () => {
    const { errors } = validatePostForm(
      {
        ...validForm,
        faq: [
          { question: "Domanda?", answer: "" },
          { question: "", answer: "Risposta." },
        ],
      },
      { isNew: false }
    )

    expect(errors["faq.0.answer"]).toBeTruthy()
    expect(errors["faq.0.question"]).toBeUndefined()
    expect(errors["faq.1.question"]).toBeTruthy()
    expect(errors["faq.1.answer"]).toBeUndefined()
  })

  it("obbliga etichetta e URL dei link interni compilati", () => {
    const { errors } = validatePostForm(
      { ...validForm, internalLinks: [{ label: "", url: "/settori/barbieri" }] },
      { isNew: false }
    )

    expect(errors["internalLinks.0.label"]).toBeTruthy()
    expect(errors["internalLinks.0.url"]).toBeUndefined()
  })

  it("accetta un link interno con URL relativo", () => {
    const { errors } = validatePostForm(
      { ...validForm, internalLinks: [{ label: "Barbieri", url: "/settori/barbieri" }] },
      { isNew: false }
    )
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it("ignora le voci FAQ/link completamente vuote", () => {
    const { errors } = validatePostForm(
      { ...validForm, faq: [], internalLinks: [] },
      { isNew: false }
    )
    expect(Object.keys(errors)).toHaveLength(0)
  })
})

describe("validatePostForm — categoria personalizzata (Altro)", () => {
  it("accetta una categoria esistente senza errori", () => {
    const { errors } = validatePostForm({ ...validForm, sectorCustom: false }, { isNew: true })
    expect(errors.sectorSlug).toBeUndefined()
  })

  it("accetta una categoria personalizzata scritta a mano", () => {
    const { errors } = validatePostForm(
      { ...validForm, sectorCustom: true, sectorSlug: "Ristoranti" },
      { isNew: true }
    )
    expect(errors.sectorSlug).toBeUndefined()
  })

  it("obbliga il testo quando è selezionato Altro", () => {
    const { errors } = validatePostForm(
      { ...validForm, sectorCustom: true, sectorSlug: "   " },
      { isNew: true }
    )
    expect(errors.sectorSlug).toBe("Inserisci una categoria/settore personalizzata.")
  })

  it("rifiuta la parola Altro come categoria personalizzata", () => {
    const { errors } = validatePostForm(
      { ...validForm, sectorCustom: true, sectorSlug: "Altro" },
      { isNew: true }
    )
    expect(errors.sectorSlug).toBe("Inserisci una categoria/settore personalizzata.")
  })

  it("rifiuta una categoria personalizzata oltre 60 caratteri", () => {
    const { errors } = validatePostForm(
      { ...validForm, sectorCustom: true, sectorSlug: "a".repeat(61) },
      { isNew: true }
    )
    expect(errors.sectorSlug).toMatch(/Massimo 60/)
  })
})

describe("countMessages", () => {
  it("conta errori e avvisi", () => {
    const messages = validatePostForm({}, { isNew: true })
    const counts = countMessages(messages)

    expect(counts.errors).toBe(5)
    expect(counts.warnings).toBeGreaterThan(0)
  })
})
