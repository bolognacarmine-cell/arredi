// Interfacce per Prodotti e Offerte della sezione Showroom
export interface Product {
  id: string
  slug: string
  name: string
  description: string
  activityCategory: string
  furnitureType: string
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
  activityCategory: string
  furnitureType: string
  discountType: "percent" | "fixed"
  discountValue: number
  productIds: string[]
  startDate: string
  endDate: string
  active: boolean
  createdAt: number
  updatedAt: number
}
