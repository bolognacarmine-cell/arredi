// Interfacce prodotti showroom (activitySector come union literal)
import type { ActivitySector } from "../constants/showroomSectors"
import {
  displaySectorLabel,
  SECTOR_LABELS,
} from "../constants/showroomSectors"

export type SortDirection = "asc" | "desc"

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  activitySector: ActivitySector
  activitySectorOther?: string
  furnitureType: string
  furnitureTypeOther?: string
  basePrice: number
  /** Sconto storico dei prodotti creati prima della promozione in scheda. */
  discountPct: number | null
  images: string[]
  sku?: string
  active: boolean
  isSold?: boolean
  createdAt: number
  updatedAt: number
  // Promozione: tutti i campi sono opzionali, un prodotto senza promozione
  // viene mostrato senza badge ne' prezzo barrato.
  promoActive?: boolean
  promoDiscountType?: PromoDiscountType | null
  promoDiscountValue?: number | null
  promoStartDate?: string | null
  promoEndDate?: string | null
  promoText?: string | null
}

export type PromoDiscountType = "percent" | "amount"

export const displaySector = (
  s: ActivitySector,
  other?: string,
): string => {
  if (s === "other") return other?.trim() || SECTOR_LABELS.other
  return displaySectorLabel(s)
}

export const displayFurnitureType = (
  t: string,
  other?: string,
): string => (t === "Altro" ? (other?.trim() ? other.trim() : "Altro") : t)
