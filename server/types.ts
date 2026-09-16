// Shared types for API requests/responses

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
  }
}

export interface MediaDocument {
  cloudinaryUrl: string
  cloudinaryPublicId: string
  title?: string
  category: "hero" | "sector" | "project" | "gallery"
  width?: number
  height?: number
  format?: string
  bytes?: number
  createdAt: Date
  updatedAt: Date
}

export interface ProjectDocument {
  id: string
  title: string
  sector: string
  sectorId: string
  location: string
  year: number
  client?: string
  description: string
  image: string
  imageCloudinaryPublicId?: string
  coverImages?: string[]
  galleryImages: string[]
  galleryCloudinaryPublicIds?: string[]
  tags: string[]
  materials: string
  status?: "bozza" | "in lavorazione" | "completato"
  featured?: boolean
  seo?: {
    metaTitle: string
    metaDescription: string
    slug: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface ProductDocument {
  id: string
  slug: string
  name: string
  description: string
  activitySector: string
  activitySectorOther?: string
  furnitureType: string
  furnitureTypeOther?: string
  basePrice: number
  discountPct: number | null
  images: string[]
  sku: string
  active: boolean
  promoActive?: boolean
  promoDiscountType?: "percent" | "amount" | null
  promoDiscountValue?: number | null
  promoStartDate?: string | null
  promoEndDate?: string | null
  promoText?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface QuoteDocument {
  id: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: "pending" | "confirmed" | "cancelled"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface SiteConfigDocument {
  id: string
  companyName: string
  contactEmail: string
  contactPhone: string
  address?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    linkedin?: string
  }
  seo?: {
    defaultTitle: string
    defaultDescription: string
  }
  createdAt: Date
  updatedAt: Date
}
