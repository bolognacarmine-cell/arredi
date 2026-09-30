// Get API base URL - use relative paths in same-origin, absolute when VITE_API_BASE_URL is set
const getApiUrl = (path: string) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (apiBaseUrl) {
    return `${apiBaseUrl.replace(/\/+$/, '')}${path}`
  }
  return path // Use relative path for same-origin
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002"

const AUTH_EXPIRED = "Sessione admin scaduta: esegui di nuovo il login e riprova"

// Una risposta non-JSON (es. pagina di errore 413/502) altrimenti farebbe fallire
// response.json() con un errore di parsing che nasconde lo status reale.
async function readJson(response: Response): Promise<any> {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Risposta non valida dal server (HTTP ${response.status})`)
  }
}

export interface Product {
  _id: string
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
  sku?: string
  isSold?: boolean
  showSoldInFrontend?: boolean
  createdAt: string
  updatedAt: string
  promoActive?: boolean
  promoDiscountType?: "percent" | "amount" | null
  promoDiscountValue?: number | null
  promoStartDate?: string | null
  promoEndDate?: string | null
  promoText?: string | null
}

/** Normalizza il documento Mongo/API al shape Product usato dal frontend. */
function normalizeProduct(raw: any): Product {
  const id = String(raw?.id || raw?._id || "")
  const toMs = (v: unknown): string => {
    if (typeof v === "number" && Number.isFinite(v)) return new Date(v).toISOString()
    if (typeof v === "string" && v) return v
    if (v instanceof Date) return v.toISOString()
    return new Date().toISOString()
  }
  return {
    ...raw,
    id,
    _id: String(raw?._id || id),
    slug: String(raw?.slug || id),
    name: String(raw?.name || ""),
    description: String(raw?.description || ""),
    activitySector: String(raw?.activitySector || raw?.activityCategory || ""),
    activitySectorOther: raw?.activitySectorOther,
    furnitureType: String(raw?.furnitureType || ""),
    furnitureTypeOther: raw?.furnitureTypeOther,
    basePrice: Number(raw?.basePrice) || 0,
    discountPct:
      raw?.discountPct === null || raw?.discountPct === undefined
        ? null
        : Number(raw.discountPct),
    images: Array.isArray(raw?.images) ? raw.images.filter(Boolean) : [],
    sku: raw?.sku,
    isSold: Boolean(raw?.isSold),
    showSoldInFrontend: raw?.showSoldInFrontend !== false,
    createdAt: toMs(raw?.createdAt),
    updatedAt: toMs(raw?.updatedAt),
    promoActive: Boolean(raw?.promoActive),
    promoDiscountType: raw?.promoDiscountType ?? null,
    promoDiscountValue: raw?.promoDiscountValue ?? null,
    promoStartDate: raw?.promoStartDate ?? null,
    promoEndDate: raw?.promoEndDate ?? null,
    promoText: raw?.promoText ?? null,
  }
}

function normalizeProductList(list: unknown): Product[] {
  if (!Array.isArray(list)) return []
  return list.map(normalizeProduct).filter((p) => Boolean(p.id))
}

export async function getProducts(filters?: { activitySector?: string }): Promise<Product[]> {
  try {
    const baseUrl = getApiUrl('/api/products')
    const url = new URL(baseUrl, window.location.origin)
    if (filters?.activitySector) url.searchParams.append("activitySector", filters.activitySector)
    // Evita risposte stale da Service Worker / HTTP cache (admin vedeva listini vecchi)
    url.searchParams.set("_", String(Date.now()))

    const response = await fetch(url.toString(), {
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    const result = await response.json()

    if (result.success && Array.isArray(result.data)) {
      return normalizeProductList(result.data)
    }

    // Fallback for legacy array responses
    if (Array.isArray(result)) return normalizeProductList(result)

    // Fallback for legacy single object responses
    if (result._id || result.id) return normalizeProductList([result])

    throw new Error(result.message || "Failed to fetch products")
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await fetch(getApiUrl(`/api/products/${id}`), {
      credentials: 'include',
    })
    const result = await response.json()

    if (result.success && result.data) {
      return result.data as Product
    }

    // Fallback for legacy direct object responses
    if (result._id || result.id) return result as Product

    throw new Error(result.message || "Failed to fetch product")
  } catch (error) {
    console.error("Error fetching product:", error)
    throw error
  }
}

export async function getProductBySlug(slug: string): Promise<Product> {
  try {
    const response = await fetch(getApiUrl(`/api/products/slug/${slug}`), {
      credentials: 'include',
    })
    const result = await response.json()

    if (result.success && result.data) {
      return result.data as Product
    }

    // Fallback for legacy direct object responses
    if (result._id || result.id) return result as Product

    throw new Error(result.message || "Failed to fetch product")
  } catch (error) {
    console.error("Error fetching product:", error)
    throw error
  }
}

export async function createProduct(data: Omit<Product, "_id" | "createdAt" | "updatedAt">): Promise<Product> {
  try {
    const response = await fetch(getApiUrl('/api/products'), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (response.status === 401 || response.status === 403) {
      throw new Error(AUTH_EXPIRED)
    }

    const result = await readJson(response)

    if (!response.ok) {
      throw new Error([result.message, result.error].filter(Boolean).join(": ") || "Failed to create product")
    }

    if (result.success && result.data) {
      return result.data as Product
    }

    // Fallback for legacy direct object responses
    if (result._id || result.id) return result as Product

    throw new Error("Invalid product payload from server")
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  try {
    const response = await fetch(getApiUrl(`/api/products/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (response.status === 401 || response.status === 403) {
      throw new Error(AUTH_EXPIRED)
    }

    const result = await readJson(response)

    if (!response.ok) {
      throw new Error([result.message, result.error].filter(Boolean).join(": ") || "Failed to update product")
    }

    if (result.success && result.data) {
      return result.data as Product
    }

    // Fallback for legacy direct object responses
    if (result._id || result.id) return result as Product

    throw new Error("Invalid product payload from server")
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const response = await fetch(getApiUrl(`/api/products/${id}`), {
      method: "DELETE",
      credentials: 'include',
    })

    if (response.status === 401 || response.status === 403) {
      throw new Error(AUTH_EXPIRED)
    }

    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(result.error?.message || result.message || "Failed to delete product")
    }
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}
