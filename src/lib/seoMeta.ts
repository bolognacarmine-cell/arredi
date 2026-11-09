/**
 * Metadati SEO per le pagine di dettaglio, lato client.
 *
 * Devono restare allineati a `server/seo.ts` (`buildProjectSeo`,
 * `buildProductSeo`, `truncateMeta`): il server li inietta nell'HTML iniziale,
 * il client li riapplica dopo il mount. Se i due formati divergono, il <title>
 * cambia sotto gli occhi dell'utente all'idratazione.
 */

export const META_TITLE_MAX = 60
export const META_DESCRIPTION_MAX = 160

/** Etichette brevi usate nei <title> dei prodotti dello showroom. */
export const SHORT_SECTOR_LABELS: Record<string, string> = {
  barber: "Barberie",
  office: "Uffici",
  retail: "Negozi",
  school: "Scuole",
  other: "Arredo",
}

/** Normalizza gli spazi e tronca a `max` caratteri senza spezzare le parole. */
export function truncateMeta(value: string, max: number): string {
  const clean = (value || "").replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean

  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  const base = lastSpace >= Math.floor(max * 0.6) ? cut.slice(0, lastSpace) : cut

  return `${base.replace(/[\s,;:.\-–—]+$/, "")}…`
}

export function productSectorLabel(sector?: string, other?: string): string {
  if (sector === "other") {
    const custom = (other || "").trim()
    return custom || SHORT_SECTOR_LABELS.other
  }
  return (sector && SHORT_SECTOR_LABELS[sector]) || SHORT_SECTOR_LABELS.other
}

export interface ProjectSeoSource {
  title: string
  sector?: string
  location?: string
  year?: number | string
  description?: string
}

export function buildProjectMeta(project: ProjectSeoSource) {
  const sector = (project.sector || "").trim()
  const title = sector ? `${project.title} - Arredamento ${sector}` : project.title

  const place =
    project.location && project.year
      ? `Realizzato a ${project.location} nel ${project.year}.`
      : ""
  const description = [project.description, place].filter(Boolean).join(" ")

  return {
    title: truncateMeta(title, META_TITLE_MAX),
    description: truncateMeta(description, META_DESCRIPTION_MAX),
  }
}

export interface ProductSeoSource {
  name: string
  description?: string
  sectorLabel?: string
}

export function buildProductMeta(product: ProductSeoSource) {
  const sector = (product.sectorLabel || "").trim()
  const title = sector
    ? `${product.name} - Arredo ${sector} | Farcom`
    : `${product.name} | Farcom`

  const description = [
    product.description,
    sector
      ? `Arredo ${sector} su misura nel showroom Farcom di Macerata Campania, con consegna in tutta Italia.`
      : "Showroom Farcom di Macerata Campania, con consegna in tutta Italia.",
  ]
    .filter(Boolean)
    .join(" ")

  return {
    title: truncateMeta(title, META_TITLE_MAX),
    description: truncateMeta(description, META_DESCRIPTION_MAX),
  }
}
