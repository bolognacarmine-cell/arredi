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

export async function getProducts(filters?: { activitySector?: string }): Promise<Product[]> {
  try {
    const baseUrl = getApiUrl('/api/products')
    const url = new URL(baseUrl, window.location.origin)
    if (filters?.activitySector) url.searchParams.append("activitySector", filters.activitySector)

    const response = await fetch(url.toString(), {
      credentials: 'include',
    })
    const result = await response.json()

    if (result.success && Array.isArray(result.data)) {
      return result.data
    }

    // Fallback for legacy array responses
    if (Array.isArray(result)) return result

    // Fallback for legacy single object responses
    if (result._id || result.id) return [result as Product]

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
