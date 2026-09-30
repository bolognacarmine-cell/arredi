// API prodotti showroom (solo server — niente seed/localStorage in lettura pubblica)
import { useEffect, useState } from "react"
import type { Product, PromoDiscountType } from "../types/showroom"
import { SECTORS, furnitureTypesFor } from "../constants/showroomSectors"
import * as productsApi from "../api/productsApi"

const P_KEY = "farcom-showroom-products-v2"

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
  // Solo API (stessa fonte dell'admin). Niente seed hardcoded / localStorage stale
  // che facevano vedere prodotti vecchi in homepage.
  return productsApi.getProducts()
}
export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await productsApi.getProductById(id)
  } catch (error) {
    console.error("Error fetching product from API:", error)
    return null
  }
}
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await productsApi.getProductBySlug(slug)
  } catch (error) {
    console.error("Error fetching product from API:", error)
    return null
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

// Admin: sempre dall'API (tutti i prodotti, anche venduti/nascosti).
// Dopo il fetch allinea anche localStorage così non restano listini seed/stale.
export function useProductsAdmin(): Product[] {
  return useRemoteList(async () => {
    const products = await productsApi.getProducts({})
    try {
      window.localStorage.setItem(P_KEY, JSON.stringify(products))
    } catch {
      /* ignore quota */
    }
    return products
  })
}

export { SECTORS, furnitureTypesFor }
export type { Product, PromoDiscountType }

