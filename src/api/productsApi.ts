const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

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
    const url = new URL(`${API_BASE_URL}/api/products`)
    if (filters?.activitySector) url.searchParams.append("activitySector", filters.activitySector)
    if (filters?.active !== undefined) url.searchParams.append("active", filters.active.toString())

    const response = await fetch(url.toString())
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch products")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch product")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching product:", error)
    throw error
  }
}

export async function getProductBySlug(slug: string): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/slug/${slug}`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch product")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching product:", error)
    throw error
  }
}

export async function createProduct(data: Omit<Product, "_id" | "createdAt" | "updatedAt">): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to create product")
    }

    return result.data
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to update product")
    }

    return result.data
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete product")
    }
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}
