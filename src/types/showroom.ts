// Interfacce prodotti e offerte showroom (activitySector come union literal)
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
  discountPct: number | null
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
  activitySector: ActivitySector
  activitySectorOther?: string
  furnitureType: string
  furnitureTypeOther?: string
  discountType: "percent" | "fixed"
  discountValue: number
  productIds: string[]
  startDate: string
  endDate: string
  active: boolean
  createdAt: number
  updatedAt: number
}

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
