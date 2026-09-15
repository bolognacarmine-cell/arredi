// Get API base URL - use relative paths in same-origin, absolute when VITE_API_BASE_URL is set
const getApiUrl = (path: string) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (apiBaseUrl) {
    return `${apiBaseUrl.replace(/\/+$/, '')}${path}`
  }
  return path // Use relative path for same-origin
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002"

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
  sku: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export async function getProducts(filters?: { activitySector?: string; active?: boolean }): Promise<Product[]> {
  try {
    const baseUrl = getApiUrl('/api/products')
    const url = new URL(baseUrl, window.location.origin)
    if (filters?.activitySector) url.searchParams.append("activitySector", filters.activitySector)
    if (filters?.active !== undefined) url.searchParams.append("active", filters.active.toString())

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

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to create product")
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

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to update product")
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

    const result = await response.json().catch(() => ({}))

    if (!response.ok && result.error) {
      throw new Error(result.error?.message || result.message || "Failed to delete product")
    }
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}
