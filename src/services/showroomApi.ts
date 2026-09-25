// API prodotti showroom (API server + fallback localStorage in lettura)
import { useEffect, useState } from "react"
import type { Product, PromoDiscountType } from "../types/showroom"
import type { ActivitySector } from "../constants/showroomSectors"
import { SECTORS, furnitureTypesFor } from "../constants/showroomSectors"
import * as productsApi from "../api/productsApi"

const P_KEY = "farcom-showroom-products-v2"

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

export const promoBadge = (type: PromoDiscountType, value: number) =>
  type === "percent" ? `-${Math.round(value)}%` : `-${Math.round(value)}€`

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

function mkP(
  id: string,
  name: string,
  description: string,
  activitySector: ActivitySector,
  furnitureType: string,
  basePrice: number,
  discountPct: number | null,
  images: string[],
  sku?: string,
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
    createdAt: now - Math.floor(Math.random() * 120) * DAY,
    updatedAt: now - Math.floor(Math.random() * 15) * DAY,
  }
}


function read<T>(k: string, fb: T): T {
  try {
    const r = window.localStorage.getItem(k)
    return r ? (JSON.parse(r) as T) : fb
  } catch {
    return fb
  }
}
export function write<T>(k: string, v: T) {
  try {
    window.localStorage.setItem(k, JSON.stringify(v))
    window.dispatchEvent(
      new CustomEvent("farcom-showroom2-updated", { detail: { k } }),
    )
  } catch {}
}
// L'admin e le pagine pubbliche leggono dall'API: dopo una scrittura le liste
// montate vanno rilette anche quando non e' passato nulla da localStorage.
function notifyShowroomUpdated() {
  try {
    window.dispatchEvent(
      new CustomEvent("farcom-showroom2-updated", { detail: { k: "api" } }),
    )
  } catch {}
}

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
  // Nessun fallback su localStorage in scrittura: un salvataggio solo locale
  // verrebbe segnalato come riuscito ma sparirebbe al ricaricamento della pagina.
  const p: Product = {
    ...data,
    id: "p" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3),
    slug: data.slug || slugify(data.name) + "-" + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const created = await productsApi.createProduct(p)
  notifyShowroomUpdated()
  return created
}
export async function updateProduct(
  id: string,
  patch: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
): Promise<Product | null> {
  const updated = await productsApi.updateProduct(id, patch)
  notifyShowroomUpdated()
  return updated
}
export async function deleteProduct(id: string): Promise<boolean> {
  await productsApi.deleteProduct(id)
  notifyShowroomUpdated()
  return true
}

export interface ActivePromo {
  discountType: PromoDiscountType
  discountValue: number
  text?: string
  startDate?: string
  endDate?: string
  badge: string
  finalPrice: number
  savings: number
}

// Promozione valida: sconto positivo, flag attivo e data odierna dentro
// l'eventuale finestra (le date sono opzionali, quindi aperte da entrambi i lati).
export function activePromo(p: Product, at = new Date()): ActivePromo | null {
  const value = Number(p.promoDiscountValue)
  if (p.promoActive === false) return null
  if (!Number.isFinite(value) || value <= 0) return null
  const t = new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime()
  if (p.promoStartDate && t < new Date(p.promoStartDate + "T00:00:00").getTime())
    return null
  if (p.promoEndDate && t > new Date(p.promoEndDate + "T23:59:59").getTime())
    return null

  const type: PromoDiscountType = p.promoDiscountType === "amount" ? "amount" : "percent"
  const raw =
    type === "percent"
      ? p.basePrice * (1 - Math.min(100, value) / 100)
      : p.basePrice - value
  const finalPrice = Math.max(0, Math.round(raw * 100) / 100)
  if (finalPrice >= p.basePrice) return null

  return {
    discountType: type,
    discountValue: value,
    text: p.promoText?.trim() || undefined,
    startDate: p.promoStartDate || undefined,
    endDate: p.promoEndDate || undefined,
    badge: promoBadge(type, value),
    finalPrice,
    savings: Math.round((p.basePrice - finalPrice) * 100) / 100,
  }
}

export interface EffectivePrice {
  finalPrice: number
  savings: number
  badge?: string
  promoText?: string
  promoEndDate?: string
}
export function computeEffectivePrice(p: Product, at = new Date()): EffectivePrice {
  const base = p.basePrice
  let best: EffectivePrice = { finalPrice: base, savings: 0 }

  // Prodotti creati prima della promozione in scheda: lo sconto fisso resta valido.
  if (p.discountPct && p.discountPct > 0) {
    const pd = discountedPrice(p)
    if (pd < best.finalPrice)
      best = { finalPrice: pd, savings: base - pd, badge: `-${p.discountPct}%` }
  }

  const promo = activePromo(p, at)
  if (promo && promo.finalPrice < best.finalPrice) {
    best = {
      finalPrice: promo.finalPrice,
      savings: promo.savings,
      badge: promo.badge,
      promoText: promo.text,
      promoEndDate: promo.endDate,
    }
  }
  return best
}

// Stessa fonte dati delle pagine pubbliche: l'API, con ricarica a ogni
// scrittura o aggiornamento proveniente da un'altra scheda.
function useRemoteList<T>(load: () => Promise<T[]>): T[] {
  const [val, setVal] = useState<T[]>([])

  useEffect(() => {
    let active = true
    const refresh = () => {
      load()
        .then((list) => {
          if (active) setVal(Array.isArray(list) ? list : [])
        })
        .catch((error) => console.error("Error loading showroom data:", error))
    }
    refresh()
    window.addEventListener?.("farcom-showroom2-updated", refresh)
    window.addEventListener?.("storage", refresh)
    return () => {
      active = false
      window.removeEventListener?.("farcom-showroom2-updated", refresh)
      window.removeEventListener?.("storage", refresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return val
}

export function useProducts(): Product[] {
  return useRemoteList(() => getProducts())
}

// Admin version that includes all products (including sold and hidden)
export function useProductsAdmin(): Product[] {
  return useRemoteList(() => productsApi.getProducts({}))
}

export { SECTORS, furnitureTypesFor }
export type { Product, PromoDiscountType }

