// API prodotti + offerte showroom (API server + fallback localStorage)
import { useEffect, useState } from "react"
import type { Product, Offer } from "../types/showroom"
import type { ActivitySector } from "../constants/showroomSectors"
import { SECTORS, furnitureTypesFor } from "../constants/showroomSectors"
import * as productsApi from "../api/productsApi"
import * as offersApi from "../api/offersApi"

const P_KEY = "farcom-showroom-products-v2"
const O_KEY = "farcom-showroom-offers-v2"

const DAY = 86_400_000
const now = Date.now()

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

export const discountedPrice = (p: { basePrice: number; discountPct: number | null }) =>
  p.discountPct && p.discountPct > 0
    ? Math.round(p.basePrice * (1 - p.discountPct / 100) * 100) / 100
    : p.basePrice

export const offerBadge = (o: {
  discountType: "percent" | "fixed"
  discountValue: number
}) =>
  o.discountType === "percent" ? `-${Math.round(o.discountValue)}%` : `${Math.round(o.discountValue)}€ OFF`

const img = (seed: string, bg = "EAE7E0", fg = "1A1A18") =>
  `https://placehold.co/1200x800/${bg}/${fg}?text=${encodeURIComponent(seed)}`

const seedProducts: Product[] = [
  mkP(
    "p01",
    "Bancone reception premium rovere",
    "Bancone reception in rovere canaletto, finitura opaca, struttura metallo verniciato bronzo, top in quarzo. Adatto a uffici e studi professionali.",
    "office",
    "Reception e banconi ingresso",
    4890,
    10,
    [img("Bancone+Reception", "EAE7E0", "1A1A18"), img("Bancone+Dettaglio", "1B4332", "F7F5F0")],
    "FAR-UFF-R01",
  ),
  mkP(
    "p02",
    "Postazione taglio Duo luce LED",
    "Postazione taglio 2 posti con specchiera retroilluminata LED integrata, mensole in vetro temperato e presa aria/energia per stazione.",
    "barber",
    "Postazioni taglio",
    3200,
    null,
    [img("Postazione+Taglio", "DDD9D0", "1A1A18")],
    "FAR-PAR-T02",
  ),
  mkP(
    "p03",
    "Specchiera retroilluminata oval 120",
    "Specchiera da parete cornice alluminio spazzolato, illuminazione perimetrale LED 3000K, anti-appannamento integrato.",
    "barber",
    "Specchiere retroilluminate",
    690,
    15,
    [img("Specchiera+Oval", "888580", "F7F5F0"), img("Specchiera+Montaggio", "B5965A", "1A1A18")],
    "FAR-BAR-S03",
  ),
  mkP(
    "p04",
    "Divano attesa modular 3 posti",
    "Sistema modulare per zone attesa con sedute removibili, rivestimento antimacchia, piedini in metallo bronzo.",
    "other",
    "Zone attesa",
    1950,
    null,
    [img("Zona+Attesa", "F7F5F0", "1A1A18"), img("Dettaglio+Tessuto", "DDD9D0", "1B4332")],
    "FAR-OTH-A04",
    undefined,
    "Poliambulatorio privato",
  ),
  mkP(
    "p05",
    "Armadio barbiere 6 ante mirror",
    "Armadiatura con ante a specchio, vani a giorno, cassettiera interna e porta attrezzi per barbieri.",
    "barber",
    "Armadiature",
    2780,
    12,
    [img("Armadio+Barberia", "1A1A18", "B5965A"), img("Armadio+Aperto", "4A4A46", "F7F5F0")],
    "FAR-BAR-A05",
  ),
  mkP(
    "p06",
    "Lavandino ceramica white + mobile",
    "Lavandino integrato in ceramica con miscelatore alto, mobile base in laminato anticalcare, ruote per spostamento.",
    "barber",
    "Lavandini integrati",
    1450,
    null,
    [img("Lavandino", "F7F5F0", "1A1A18")],
    "FAR-PAR-L06",
  ),
  mkP(
    "p07",
    "Vetrina espositiva L200 LED",
    "Vetrina a tutta altezza con ante in vetro, LED interni 4000K e ripiani regolabili in vetro temperato.",
    "other",
    "Vetrine",
    2190,
    8,
    [img("Vetrina+Espositiva", "EAE7E0", "1A1A18"), img("Vetrina+Interno", "B5965A", "1A1A18")],
    "FAR-OTH-V07",
    undefined,
    "Showroom forniture speciali",
  ),
  mkP(
    "p08",
    "Poltrona operativa ergonomica",
    "Seduta ergonomica con supporto lombare, rotelle parquet, braccioli regolabili e reclinazione schienale.",
    "office",
    "Sedute operative",
    720,
    20,
    [img("Poltrona+Operativa", "1B4332", "F7F5F0")],
    "FAR-UFF-S08",
  ),
  mkP(
    "p09",
    "Scrivania direzionale Top in legno",
    "Top 180x90 in rovere, struttura in metallo verniciato, cassettiera mobile con 3 cassetti inclusa.",
    "office",
    "Scrivanie e postazioni",
    1690,
    null,
    [img("Scrivania+Direz", "DDD9D0", "1A1A18"), img("Scrivania+Lato", "888580", "F7F5F0")],
    "FAR-UFF-D09",
  ),
  mkP(
    "p10",
    "Libreria scaffale scuola 3 ripiani",
    "Sistema a scaffalature in metallo e legno, 3 ripiani regolabili, carico 80kg per ripiano.",
    "school",
    "Librerie aula",
    590,
    null,
    [img("Scaffalatura+Scuola", "F7F5F0", "4A4A46")],
    "FAR-SCU-F10",
  ),
  mkP(
    "p11",
    "Faretto LED tecnico per postazioni",
    "Illuminazione tecnica orientabile 36W su binario, CRI 90, temperatura colore 4000K, ideale per postazioni taglio.",
    "barber",
    "Illuminazione tecnica per arredo",
    280,
    null,
    [img("Faretto+LED", "1A1A18", "B5965A")],
    "FAR-PAR-I11",
  ),
  mkP(
    "p12",
    "Sistema reception modulare custom",
    "Composizione custom banconi + colonne + vetrine per hall. Configurabile su misura con finiture premium.",
    "other",
    "Elementi modulari per arredo",
    8900,
    null,
    [img("Sistema+Modulare", "EAE7E0", "1A1A18"), img("Hall+Render", "B5965A", "1A1A18")],
    "FAR-OTH-M12",
    undefined,
    "Residenza universitaria",
  ),
  mkP(
    "p13",
    "Banco scuola singolo con contenitore",
    "Banco operativo per scuola con piano in laminato antigraffio, contenitore sotto-piano e gancio zaino.",
    "school",
    "Banchi e sedie ergonomiche",
    340,
    5,
    [img("Banco+Scuola", "F7F5F0", "1B4332")],
    "FAR-SCU-B13",
  ),
  mkP(
    "p14",
    "Postazione trucco professionale",
    "Postazione styling con specchiera ring-light integrata, piano ampio, vani porta trucchi e presa multipla.",
    "barber",
    "Postazioni trucco / styling",
    1850,
    null,
    [img("Postazione+Trucco", "DDD9D0", "1A1A18")],
    "FAR-OTH-T14",
    "Centro estetico",
  ),
  mkP(
    "p15",
    "Cassettiera sicurezza 4 cassetti",
    "Armadietto a 4 cassetti con serratura centralizzata, struttura in metallo, finitura antimpronta.",
    "office",
    "Cassettiere",
    480,
    null,
    [img("Cassettiera+Ufficio", "888580", "F7F5F0")],
    "FAR-UFF-C15",
  ),
  mkP(
    "p16",
    "Sedia attesa impilabile premium",
    "Sedia per zona attesa con struttura in metallo, seduta in tessuto tecnico, impilabile fino a 8 pezzi.",
    "other",
    "Altro",
    210,
    null,
    [img("Sedia+Attesa", "EAE7E0", "1B4332")],
    "FAR-OTH-O16",
    "Tribunale e uffici pubblici",
    "Sedute impilabili per sale attesa pubbliche",
  ),
]

const seedOffers: Offer[] = [
  {
    id: "o01",
    title: "Opening Parrucchieri -15%",
    description: "Sconto dedicato a nuove aperture di saloni. Postazioni taglio, specchiere e lavandini in promozione.",
    activitySector: "barber",
    furnitureType: "Altro",
    furnitureTypeOther: "Kit apertura salone",
    discountType: "percent",
    discountValue: 15,
    productIds: ["p02", "p06", "p11"],
    startDate: ISO(-1),
    endDate: ISO(30),
    active: true,
    createdAt: now - 2 * DAY,
    updatedAt: now - 1 * DAY,
  },
  {
    id: "o02",
    title: "Pacchetto Barberia Gold",
    description: "Kit completo per aprire una barberia: specchiera + armadio + 300€ di sconto fisso.",
    activitySector: "barber",
    furnitureType: "Altro",
    furnitureTypeOther: "Pacchetto arredamento barberia",
    discountType: "fixed",
    discountValue: 300,
    productIds: ["p03", "p05"],
    startDate: ISO(-5),
    endDate: ISO(45),
    active: true,
    createdAt: now - 5 * DAY,
    updatedAt: now - 3 * DAY,
  },
  {
    id: "o03",
    title: "Back to School -10%",
    description: "Promozione inizio anno scolastico: -10% su scaffalature, banchi scuola e scrivanie.",
    activitySector: "school",
    furnitureType: "Altro",
    furnitureTypeOther: "Kit arredamento aule",
    discountType: "percent",
    discountValue: 10,
    productIds: ["p10", "p09", "p13"],
    startDate: ISO(10),
    endDate: ISO(60),
    active: false,
    createdAt: now - 10 * DAY,
    updatedAt: now - 1 * DAY,
  },
  {
    id: "o04",
    title: "Arreda il tuo Studio",
    description: "Zone attesa e reception per studi professionali: -8% + consegna inclusa.",
    activitySector: "other",
    activitySectorOther: "Studi professionali / Poliambulatori",
    furnitureType: "Reception e banconi ingresso",
    discountType: "percent",
    discountValue: 8,
    productIds: ["p04", "p01"],
    startDate: ISO(-20),
    endDate: ISO(10),
    active: true,
    createdAt: now - 20 * DAY,
    updatedAt: now - 10 * DAY,
  },
  {
    id: "o05",
    title: "Showroom Ufficio -12%",
    description: "Rinnova il tuo ufficio: -12% su scrivanie, sedute e armadietti. Spedizione gratuita oltre i 2000€.",
    activitySector: "office",
    furnitureType: "Scrivanie e postazioni",
    discountType: "percent",
    discountValue: 12,
    productIds: ["p09", "p08", "p15"],
    startDate: ISO(-3),
    endDate: ISO(25),
    active: true,
    createdAt: now - 3 * DAY,
    updatedAt: now - 2 * DAY,
  },
]

function mkP(
  id: string,
  name: string,
  description: string,
  activitySector: ActivitySector,
  furnitureType: string,
  basePrice: number,
  discountPct: number | null,
  images: string[],
  sku: string,
  furnitureTypeOther?: string,
  activitySectorOther?: string,
): Product {
  return {
    id,
    slug: slugify(name) + "-" + id.slice(-3),
    name,
    description,
    activitySector,
    activitySectorOther,
    furnitureType,
    furnitureTypeOther,
    basePrice,
    discountPct,
    images,
    sku,
    active: true,
    createdAt: now - Math.floor(Math.random() * 120) * DAY,
    updatedAt: now - Math.floor(Math.random() * 15) * DAY,
  }
}

function ISO(offsetDays: number) {
  const d = new Date(now + offsetDays * DAY)
  return d.toISOString().slice(0, 10)
}

function read<T>(k: string, fb: T): T {
  try {
    const r = window.localStorage.getItem(k)
    return r ? (JSON.parse(r) as T) : fb
  } catch {
    return fb
  }
}
function write<T>(k: string, v: T) {
  try {
    window.localStorage.setItem(k, JSON.stringify(v))
    window.dispatchEvent(
      new CustomEvent("farcom-showroom2-updated", { detail: { k } }),
    )
  } catch {}
}
const delay = <T>(v: T, min = 120, max = 500) =>
  new Promise<T>((r) =>
    setTimeout(() => r(v), Math.floor(Math.random() * (max - min + 1)) + min),
  )

export async function getProducts(): Promise<Product[]> {
  try {
    return await productsApi.getProducts()
  } catch (error) {
    console.error("Error fetching products from API, falling back to localStorage:", error)
    return read<Product[]>(P_KEY, seedProducts)
  }
}
export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await productsApi.getProductById(id)
  } catch (error) {
    console.error("Error fetching product from API, falling back to localStorage:", error)
    return read<Product[]>(P_KEY, seedProducts).find((p) => p.id === id) ?? null
  }
}
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await productsApi.getProductBySlug(slug)
  } catch (error) {
    console.error("Error fetching product from API, falling back to localStorage:", error)
    return read<Product[]>(P_KEY, seedProducts).find((p) => p.slug === slug) ?? null
  }
}
export async function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt" | "slug"> & {
    slug?: string
  },
): Promise<Product> {
  try {
    const p: Product = {
      ...data,
      id: "p" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3),
      slug: data.slug || slugify(data.name) + "-" + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return await productsApi.createProduct(p)
  } catch (error) {
    console.error("Error creating product via API, falling back to localStorage:", error)
    const list = read<Product[]>(P_KEY, seedProducts)
    const p: Product = {
      ...data,
      id: "p" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3),
      slug: data.slug || slugify(data.name) + "-" + Math.random().toString(36).slice(2, 6),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const next = [p, ...list]
    write(P_KEY, next)
    return delay(p)
  }
}
export async function updateProduct(
  id: string,
  patch: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
): Promise<Product | null> {
  try {
    return await productsApi.updateProduct(id, patch)
  } catch (error) {
    console.error("Error updating product via API, falling back to localStorage:", error)
    const list = read<Product[]>(P_KEY, seedProducts)
    const i = list.findIndex((p) => p.id === id)
    if (i === -1) return delay(null)
    const updated: Product = {
      ...list[i],
      ...patch,
      slug: patch.name ? slugify(patch.name) + "-" + list[i].id.slice(-3) : list[i].slug,
      updatedAt: Date.now(),
    }
    list[i] = updated
    write(P_KEY, list)
    return delay(updated)
  }
}
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await productsApi.deleteProduct(id)
    return true
  } catch (error) {
    console.error("Error deleting product via API, falling back to localStorage:", error)
    const list = read<Product[]>(P_KEY, seedProducts)
    const before = list.length
    const next = list.filter((p) => p.id !== id)
    if (next.length < before) write(P_KEY, next)
    return delay(next.length < before)
  }
}

export async function getOffers(): Promise<Offer[]> {
  try {
    return await offersApi.getOffers()
  } catch (error) {
    console.error("Error fetching offers from API, falling back to localStorage:", error)
    return read<Offer[]>(O_KEY, seedOffers)
  }
}
export async function getOfferById(id: string): Promise<Offer | null> {
  try {
    return await offersApi.getOfferById(id)
  } catch (error) {
    console.error("Error fetching offer from API, falling back to localStorage:", error)
    return read<Offer[]>(O_KEY, seedOffers).find((o) => o.id === id) ?? null
  }
}
export async function createOffer(
  data: Omit<Offer, "id" | "createdAt" | "updatedAt">,
): Promise<Offer> {
  try {
    const o: Offer = {
      ...data,
      id: "o" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return await offersApi.createOffer(o)
  } catch (error) {
    console.error("Error creating offer via API, falling back to localStorage:", error)
    const list = read<Offer[]>(O_KEY, seedOffers)
    const o: Offer = {
      ...data,
      id: "o" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    write(O_KEY, [o, ...list])
    return delay(o)
  }
}
export async function updateOffer(
  id: string,
  patch: Partial<Omit<Offer, "id" | "createdAt" | "updatedAt">>,
): Promise<Offer | null> {
  try {
    return await offersApi.updateOffer(id, patch)
  } catch (error) {
    console.error("Error updating offer via API, falling back to localStorage:", error)
    const list = read<Offer[]>(O_KEY, seedOffers)
    const i = list.findIndex((o) => o.id === id)
    if (i === -1) return delay(null)
    const updated: Offer = { ...list[i], ...patch, updatedAt: Date.now() }
    list[i] = updated
    write(O_KEY, list)
    return delay(updated)
  }
}
export async function deleteOffer(id: string): Promise<boolean> {
  try {
    await offersApi.deleteOffer(id)
    return true
  } catch (error) {
    console.error("Error deleting offer via API, falling back to localStorage:", error)
    const list = read<Offer[]>(O_KEY, seedOffers)
    const before = list.length
    const next = list.filter((o) => o.id !== id)
    if (next.length < before) write(O_KEY, next)
    return delay(next.length < before)
  }
}

export interface EffectivePrice {
  finalPrice: number
  savings: number
  badge?: string
  offerId?: string
}
export function computeEffectivePrice(
  p: Product,
  offers: Offer[],
  at = new Date(),
): EffectivePrice {
  const t = new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime()
  const base = p.basePrice
  let best: EffectivePrice = { finalPrice: base, savings: 0 }
  if (p.discountPct && p.discountPct > 0) {
    const pd = discountedPrice(p)
    if (pd < best.finalPrice)
      best = { finalPrice: pd, savings: base - pd, badge: `-${p.discountPct}%` }
  }
  for (const o of offers) {
    if (!o.active) continue
    if (!o.productIds.includes(p.id)) continue
    const s = new Date(o.startDate).getTime()
    const e = new Date(o.endDate + "T23:59:59").getTime()
    if (t < s || t > e) continue
    const op =
      o.discountType === "percent"
        ? base * (1 - Math.min(100, Math.max(0, o.discountValue)) / 100)
        : base - o.discountValue
    const rounded = Math.max(0, Math.round(op * 100) / 100)
    if (rounded < best.finalPrice) {
      best = {
        finalPrice: rounded,
        savings: base - rounded,
        badge: offerBadge(o),
        offerId: o.id,
      }
    }
  }
  return best
}

export function useProducts(): Product[] {
  const [val, setVal] = useState<Product[]>(() =>
    typeof window !== "undefined" ? read<Product[]>(P_KEY, seedProducts) : seedProducts,
  )
  useEffect(() => {
    const cb = () => setVal(read<Product[]>(P_KEY, seedProducts))
    window.addEventListener?.("farcom-showroom2-updated", cb)
    window.addEventListener?.("storage", cb)
    return () => {
      window.removeEventListener?.("farcom-showroom2-updated", cb)
      window.removeEventListener?.("storage", cb)
    }
  }, [])
  return val
}
export function useOffers(): Offer[] {
  const [val, setVal] = useState<Offer[]>(() =>
    typeof window !== "undefined" ? read<Offer[]>(O_KEY, seedOffers) : seedOffers,
  )
  useEffect(() => {
    const cb = () => setVal(read<Offer[]>(O_KEY, seedOffers))
    window.addEventListener?.("farcom-showroom2-updated", cb)
    window.addEventListener?.("storage", cb)
    return () => {
      window.removeEventListener?.("farcom-showroom2-updated", cb)
      window.removeEventListener?.("storage", cb)
    }
  }, [])
  return val
}

export { SECTORS, furnitureTypesFor }
export type { Product, Offer }

