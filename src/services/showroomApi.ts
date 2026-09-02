// servizi/showroomApi.ts — MOCK API
// Simula il backend per la sezione Admin Showroom.
// Ogni funzione usa un `setTimeout` per simulare la latenza di rete (200–700ms).
// Tutti i dati persistono in localStorage (chiave "farcom-showroom") cosi i
// cambiamenti fatti in Admin sopravvivono ai refresh, esattamente come fanno
// projectStore / quoteStore nel resto del sito.
//
// 🔗 Quando arrivera il backend reale:
//    1. Sostituisci ogni corpo di funzione con una fetch() / axios verso il tuo server
//       (es. GET /api/showroom/products, POST /api/showroom/products, ecc.)
//    2. Mantieni le stesse interfacce Product / Offer in modo da non dover
//       ritoccare pagine e componenti che le consumano.
//    3. Se usi TanStack Query (consigliato), wrappa le chiamate dentro
//       useQuery / useMutation invece di chiamare direttamente le funzioni.

import { useEffect, useState } from "react"

// ============================================================
// INTERFACCE
// ============================================================

export interface Product {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  discountedPrice?: number | null
  images: string[]
  sku: string
  active: boolean
  createdAt: number
  updatedAt: number
}

export interface Offer {
  id: string
  title: string
  description: string
  discountType: "percent" | "fixed"
  discountValue: number
  productIds: string[]
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  active: boolean
  badgeText: string // es. "-20%", "50€ OFF", "Offerta limitata"
  createdAt: number
  updatedAt: number
}

export type SortDirection = "asc" | "desc"

export interface ProductsFilters {
  q: string
  category: string
  offerStatus: "all" | "in_offer" | "no_offer" | "active" | "inactive"
  sortKey: keyof Pick<Product, "name" | "category" | "basePrice" | "createdAt">
  sortDir: SortDirection
  page: number
  pageSize: number
}

export interface OffersFilters {
  q: string
  active: "all" | "active" | "inactive"
  page: number
  pageSize: number
}

// ============================================================
// DATI DI ESEMPIO (seed iniziali)
// ============================================================

const CATEGORIES = [
  "Soggiorno",
  "Cucina",
  "Camera da letto",
  "Bagno",
  "Ufficio",
  "Esterno",
  "Su misura",
]

const now = Date.now()
const DAY = 86_400_000

const seedProducts: Product[] = [
  {
    id: "p-001",
    name: "Divano in pelle Chesterfield 3 posti",
    description:
      "Divano classico Chesterfield rivestito in vera pelle italiana, struttura in legno massello, bottoni trapuntati e finiture in bronzo scuro. Perfetto per uno studio o un soggiorno dallo stile tradizionale.",
    category: "Soggiorno",
    basePrice: 3890,
    discountedPrice: 3190,
    images: [
      "https://placehold.co/1200x800/EAE7E0/1A1A18?text=Divano+Chesterfield+1",
      "https://placehold.co/1200x800/F7F5F0/1B4332?text=Divano+Chesterfield+2",
      "https://placehold.co/1200x800/DDD9D0/4A4A46?text=Divano+Chesterfield+3",
    ],
    sku: "FAR-SOG-001",
    active: true,
    createdAt: now - 40 * DAY,
    updatedAt: now - 5 * DAY,
  },
  {
    id: "p-002",
    name: "Cucina moderna in rovere e acciaio",
    description:
      "Cucina lineare 6 metri, pensili in rovere spazzolato, top in quarzo, elettrodomestici da incasso inclusi, isola centrale con top in acciaio inox.",
    category: "Cucina",
    basePrice: 12500,
    discountedPrice: null,
    images: [
      "https://placehold.co/1200x800/DDD9D0/1A1A18?text=Cucina+Rovere",
    ],
    sku: "FAR-CUC-007",
    active: true,
    createdAt: now - 60 * DAY,
    updatedAt: now - 12 * DAY,
  },
  {
    id: "p-003",
    name: "Letto matrimoniale con testiera capitonne'",
    description:
      "Testiera imbottita e capitonnè in tessuto antimacchia, rete doghe in legno, cassetti contenitori laterali inclusi. Disponibile in oltre 50 varianti di tessuto.",
    category: "Camera da letto",
    basePrice: 2190,
    discountedPrice: 1790,
    images: [
      "https://placehold.co/1200x800/F7F5F0/1A1A18?text=Letto+Capitonné+1",
      "https://placehold.co/1200x800/EAE7E0/1B4332?text=Letto+Capitonné+2",
    ],
    sku: "FAR-CAM-012",
    active: true,
    createdAt: now - 25 * DAY,
    updatedAt: now - 2 * DAY,
  },
  {
    id: "p-004",
    name: "Mobile bagno in legno teak 120cm",
    description:
      "Mobile bagno sospeso in legno teak certificato FSC, due cassetti con chiusura soft-close, piano in gres porcellanato effetto pietra, specchio LED incluso.",
    category: "Bagno",
    basePrice: 1890,
    discountedPrice: null,
    images: [
      "https://placehold.co/1200x800/EAE7E0/4A4A46?text=Mobile+Bagno+Teak",
    ],
    sku: "FAR-BAG-003",
    active: true,
    createdAt: now - 70 * DAY,
    updatedAt: now - 20 * DAY,
  },
  {
    id: "p-005",
    name: "Scrivania direzionale executive in noce",
    description:
      "Scrivania direzionale top 240×110 in noce canaletto, cassettiera laterale con 3 cassetti, finitura opaca cerata a mano. Compresa cable management integrato.",
    category: "Ufficio",
    basePrice: 3400,
    discountedPrice: 2890,
    images: [
      "https://placehold.co/1200x800/1A1A18/B5965A?text=Scrivania+Noce+1",
      "https://placehold.co/1200x800/1B4332/F7F5F0?text=Scrivania+Noce+2",
      "https://placehold.co/1200x800/4A4A46/B5965A?text=Scrivania+Noce+3",
      "https://placehold.co/1200x800/888580/1A1A18?text=Scrivania+Noce+4",
    ],
    sku: "FAR-UFF-020",
    active: true,
    createdAt: now - 90 * DAY,
    updatedAt: now - 8 * DAY,
  },
  {
    id: "p-006",
    name: "Salotto giardino outdoor in alluminio",
    description:
      "Set 4 posti: divano 2 posti, 2 poltrone, tavolino basso. Struttura in alluminio verniciato a polvere antracite, cuscini in tessuto Sunbrella idrorepellente.",
    category: "Esterno",
    basePrice: 2690,
    discountedPrice: null,
    images: [
      "https://placehold.co/1200x800/1B4332/F7F5F0?text=Salotto+Outdoor",
    ],
    sku: "FAR-EST-008",
    active: true,
    createdAt: now - 50 * DAY,
    updatedAt: now - 15 * DAY,
  },
  {
    id: "p-007",
    name: "Libreria a ponte su misura rovere",
    description:
      "Libreria a ponte realizzata su misura in rovere sbiancato, elementi sospesi, inserti in marmo statuario, LED integrati. Progetto e preventivo personalizzato.",
    category: "Su misura",
    basePrice: 9800,
    discountedPrice: null,
    images: [
      "https://placehold.co/1200x800/B5965A/1A1A18?text=Libreria+Su+Misura+1",
      "https://placehold.co/1200x800/F7F5F0/1B4332?text=Libreria+Su+Misura+2",
    ],
    sku: "FAR-SMS-033",
    active: true,
    createdAt: now - 120 * DAY,
    updatedAt: now - 30 * DAY,
  },
  {
    id: "p-008",
    name: "Poltrona lounge in velluto bordeaux",
    description:
      "Poltrona lounge con schienale alto e poggiapiedi coordinato. Struttura in frassino, rivestimento in velluto di cotone made in Italy color bordeaux.",
    category: "Soggiorno",
    basePrice: 1450,
    discountedPrice: 1160,
    images: [
      "https://placehold.co/1200x800/882A3A/F7F5F0?text=Poltrona+Velluto",
    ],
    sku: "FAR-SOG-045",
    active: false,
    createdAt: now - 150 * DAY,
    updatedAt: now - 60 * DAY,
  },
  {
    id: "p-009",
    name: "Tavolo da pranzo allungabile 180–240",
    description:
      "Top in vetro temperato e struttura in metallo verniciato bronzo. Sistema di allungo integrato, si estende da 180 a 240 cm in pochi secondi.",
    category: "Soggiorno",
    basePrice: 2380,
    discountedPrice: null,
    images: [
      "https://placehold.co/1200x800/EAE7E0/1A1A18?text=Tavolo+Allungabile",
    ],
    sku: "FAR-SOG-070",
    active: true,
    createdAt: now - 35 * DAY,
    updatedAt: now - 7 * DAY,
  },
  {
    id: "p-010",
    name: "Wardrobe cabina armadio walk-in",
    description:
      "Cabina armadio walk-in 4×3 metri, moduli in melamina effetto rovere, mensole, cassettiere, aste appenderia, vano scarpe e specchio full-height.",
    category: "Camera da letto",
    basePrice: 5600,
    discountedPrice: 4790,
    images: [
      "https://placehold.co/1200x800/4A4A46/B5965A?text=Walk-in+Closet+1",
      "https://placehold.co/1200x800/DDD9D0/1A1A18?text=Walk-in+Closet+2",
    ],
    sku: "FAR-CAM-088",
    active: true,
    createdAt: now - 15 * DAY,
    updatedAt: now - 1 * DAY,
  },
]

const seedOffers: Offer[] = [
  {
    id: "o-001",
    title: "Collezione Autunno — Soggiorni in promo",
    description:
      "Promozione dedicata alla stagione autunnale: sconti speciali su tutta la gamma divani e complementi soggiorno. Valida su ordini confermati entro il 30 novembre.",
    discountType: "percent",
    discountValue: 18,
    productIds: ["p-001", "p-008", "p-009"],
    startDate: new Date(now - 3 * DAY).toISOString().slice(0, 10),
    endDate: new Date(now + 60 * DAY).toISOString().slice(0, 10),
    active: true,
    badgeText: "-18% Autunno",
    createdAt: now - 3 * DAY,
    updatedAt: now - 2 * DAY,
  },
  {
    id: "o-002",
    title: "Showroom Demo — 500€ di sconto",
    description:
      "Ritiro in showroom di un pezzo esposizione: sconto fisso di 500 euro per tutti gli articoli demo selezionati. Pezzo unico, disponibile fino ad esaurimento.",
    discountType: "fixed",
    discountValue: 500,
    productIds: ["p-005", "p-003"],
    startDate: new Date(now - 1 * DAY).toISOString().slice(0, 10),
    endDate: new Date(now + 20 * DAY).toISOString().slice(0, 10),
    active: true,
    badgeText: "500€ OFF Demo",
    createdAt: now - 1 * DAY,
    updatedAt: now,
  },
  {
    id: "o-003",
    title: "Black Friday Arredamento",
    description:
      "Anteprima Black Friday: 25% su tutti i prodotti selezionati. Iscriviti alla newsletter per ricevere il codice sconto esclusivo.",
    discountType: "percent",
    discountValue: 25,
    productIds: ["p-002", "p-004", "p-010", "p-006"],
    startDate: new Date(now + 5 * DAY).toISOString().slice(0, 10),
    endDate: new Date(now + 25 * DAY).toISOString().slice(0, 10),
    active: false,
    badgeText: "-25% BF",
    createdAt: now - 5 * DAY,
    updatedAt: now - 3 * DAY,
  },
  {
    id: "o-004",
    title: "Fuori Salone 2025 — Edizione Limitata",
    description:
      "Prezzo promozionale per i pezzi di edizione limitata presentati durante il Fuori Salone. Consegna immediata disponibile.",
    discountType: "fixed",
    discountValue: 1000,
    productIds: ["p-007"],
    startDate: new Date(now - 20 * DAY).toISOString().slice(0, 10),
    endDate: new Date(now + 90 * DAY).toISOString().slice(0, 10),
    active: true,
    badgeText: "Offerta limitata",
    createdAt: now - 20 * DAY,
    updatedAt: now - 18 * DAY,
  },
]

// ============================================================
// STORAGE LAYER (persistenza browser)
// ============================================================

const PRODUCTS_KEY = "farcom-showroom-products"
const OFFERS_KEY = "farcom-showroom-offers"

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(
    new CustomEvent<{ key: string }>("farcom-showroom-updated", {
      detail: { key },
    }),
  )
}

function delay<T>(data: T, min = 200, max = 700): Promise<T> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now()
    .toString(36)
    .slice(-4)}`
}

// ============================================================
// API — PRODUCTS
// ============================================================

export async function getProducts(): Promise<Product[]> {
  const list = readLS<Product[]>(PRODUCTS_KEY, seedProducts)
  return delay(list)
}

export async function getProductById(id: string): Promise<Product | null> {
  const list = await getProducts()
  return delay(list.find((p) => p.id === id) ?? null)
}

export async function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Promise<Product> {
  const list = readLS<Product[]>(PRODUCTS_KEY, seedProducts)
  const newProd: Product = {
    ...data,
    id: uid("p"),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const next = [newProd, ...list]
  writeLS(PRODUCTS_KEY, next)
  return delay(newProd)
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
): Promise<Product | null> {
  const list = readLS<Product[]>(PRODUCTS_KEY, seedProducts)
  const idx = list.findIndex((p) => p.id === id)
  if (idx === -1) return delay(null)
  const updated: Product = {
    ...list[idx],
    ...data,
    updatedAt: Date.now(),
  }
  list[idx] = updated
  writeLS(PRODUCTS_KEY, list)
  return delay(updated)
}

export async function deleteProduct(id: string): Promise<boolean> {
  const list = readLS<Product[]>(PRODUCTS_KEY, seedProducts)
  const next = list.filter((p) => p.id !== id)
  const deleted = next.length !== list.length
  if (deleted) writeLS(PRODUCTS_KEY, next)
  return delay(deleted)
}

// ============================================================
// API — OFFERS
// ============================================================

export async function getOffers(): Promise<Offer[]> {
  const list = readLS<Offer[]>(OFFERS_KEY, seedOffers)
  return delay(list)
}

export async function getOfferById(id: string): Promise<Offer | null> {
  const list = await getOffers()
  return delay(list.find((o) => o.id === id) ?? null)
}

export async function createOffer(
  data: Omit<Offer, "id" | "createdAt" | "updatedAt">,
): Promise<Offer> {
  const list = readLS<Offer[]>(OFFERS_KEY, seedOffers)
  const newOffer: Offer = {
    ...data,
    id: uid("o"),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const next = [newOffer, ...list]
  writeLS(OFFERS_KEY, next)
  return delay(newOffer)
}

export async function updateOffer(
  id: string,
  data: Partial<Omit<Offer, "id" | "createdAt" | "updatedAt">>,
): Promise<Offer | null> {
  const list = readLS<Offer[]>(OFFERS_KEY, seedOffers)
  const idx = list.findIndex((o) => o.id === id)
  if (idx === -1) return delay(null)
  const updated: Offer = {
    ...list[idx],
    ...data,
    updatedAt: Date.now(),
  }
  list[idx] = updated
  writeLS(OFFERS_KEY, list)
  return delay(updated)
}

export async function deleteOffer(id: string): Promise<boolean> {
  const list = readLS<Offer[]>(OFFERS_KEY, seedOffers)
  const next = list.filter((o) => o.id !== id)
  const deleted = next.length !== list.length
  if (deleted) writeLS(OFFERS_KEY, next)
  return delay(deleted)
}

// ============================================================
// BUSINESS LOGIC — PREZZO E SCONTO MIGLIORE
// ============================================================

/**
 * Calcola il prezzo "finale" di un prodotto incrociando il suo campo
 * `discountedPrice` con le offerte attive che lo includono.
 *
 * REGOLE:
 * 1. Seleziona tutte le offerte `active === true` la cui finestra temporale
 *    (startDate ≤ oggi ≤ endDate) include il prodotto (productIds.includes(id)).
 * 2. Per ognuna calcola quale prezzo risulterebbe:
 *      - discountType === 'percent'  → basePrice * (1 - discountValue/100)
 *      - discountType === 'fixed'    → basePrice - discountValue
 * 3. Confronta con `discountedPrice` eventualmente scritto nel prodotto.
 * 4. Restituisce il prezzo MINIMO tra tutti (miglior sconto per l'utente).
 *
 * ⚠️ Questa logica è scritta nel frontend per comodità, ma in produzione
 *    DOVREBBE essere calcolata server-side durante il rendering (o dentro
 *    una funzione dedicata esposta dal backend) per evitare tampering.
 */
export interface EffectivePriceResult {
  finalPrice: number
  appliedSource:
    | "base"
    | "product_discount"
    | { offerId: string; badge: string }
  savings: number
  badgeText?: string
}

export function computeEffectivePrice(
  product: Product,
  offers: Offer[],
  atDate: Date = new Date(),
): EffectivePriceResult {
  const today = new Date(
    atDate.getFullYear(),
    atDate.getMonth(),
    atDate.getDate(),
  ).getTime()
  const startOfDay = (s: string) => new Date(s).getTime()
  const endOfDay = (s: string) => new Date(s).getTime() + DAY - 1

  const candidates: Array<{
    price: number
    source: EffectivePriceResult["appliedSource"]
    badge?: string
  }> = [{ price: product.basePrice, source: "base" }]

  if (product.discountedPrice && product.discountedPrice < product.basePrice) {
    candidates.push({
      price: product.discountedPrice,
      source: "product_discount",
      badge: `-${Math.round(
        ((product.basePrice - product.discountedPrice) / product.basePrice) *
          100,
      )}%`,
    })
  }

  for (const offer of offers) {
    if (!offer.active) continue
    if (!offer.productIds.includes(product.id)) continue
    const s = startOfDay(offer.startDate)
    const e = endOfDay(offer.endDate)
    if (today < s || today > e) continue

    const offerPrice =
      offer.discountType === "percent"
        ? product.basePrice * (1 - Math.max(0, Math.min(100, offer.discountValue)) / 100)
        : product.basePrice - offer.discountValue

    const clamped = Math.max(0, Math.round(offerPrice * 100) / 100)
    candidates.push({
      price: clamped,
      source: { offerId: offer.id, badge: offer.badgeText || "Offerta" },
      badge: offer.badgeText,
    })
  }

  candidates.sort((a, b) => a.price - b.price)
  const best = candidates[0]
  return {
    finalPrice: Math.round(best.price * 100) / 100,
    appliedSource: best.source,
    savings: Math.round((product.basePrice - best.price) * 100) / 100,
    badgeText: best.badge,
  }
}

// ============================================================
// HOOK UTILE: sottoscrizione dati in tempo reale
// ============================================================

export function useShowroomProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>(() =>
    readLS<Product[]>(PRODUCTS_KEY, seedProducts),
  )
  useEffect(() => {
    const sync = () => setProducts(readLS<Product[]>(PRODUCTS_KEY, seedProducts))
    window.addEventListener?.("farcom-showroom-updated", sync)
    window.addEventListener?.("storage", sync)
    return () => {
      window.removeEventListener?.("farcom-showroom-updated", sync)
      window.removeEventListener?.("storage", sync)
    }
  }, [])
  return products
}

export function useShowroomOffers(): Offer[] {
  const [offers, setOffers] = useState<Offer[]>(() =>
    readLS<Offer[]>(OFFERS_KEY, seedOffers),
  )
  useEffect(() => {
    const sync = () => setOffers(readLS<Offer[]>(OFFERS_KEY, seedOffers))
    window.addEventListener?.("farcom-showroom-updated", sync)
    window.addEventListener?.("storage", sync)
    return () => {
      window.removeEventListener?.("farcom-showroom-updated", sync)
      window.removeEventListener?.("storage", sync)
    }
  }, [])
  return offers
}

export const SHOWROOM_CATEGORIES = CATEGORIES
