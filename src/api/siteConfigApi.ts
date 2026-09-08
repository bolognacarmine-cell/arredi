// Su Render il backend non è disponibile, disabilitiamo le chiamate API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""
const isApiAvailable = !!API_BASE_URL

export interface SocialLinks {
  facebook?: string
  instagram?: string
  linkedin?: string
}

export interface SeoConfig {
  defaultTitle: string
  defaultDescription: string
}

export interface SiteConfig {
  _id: string
  id: string
  companyName: string
  contactEmail: string
  contactPhone: string
  address?: string
  socialLinks?: SocialLinks
  seo?: SeoConfig
  createdAt: string
  updatedAt: string
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (!isApiAvailable) {
    throw new Error("API not available")
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/site-config`)
    const result = await response.json()

    if (result._id) {
      return result
    }

    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || "Failed to fetch site config")
  } catch (error) {
    throw error
  }
}

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<SiteConfig> {
  if (!isApiAvailable) {
    throw new Error("API not available")
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/site-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result._id) {
      return result
    }

    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || "Failed to update site config")
  } catch (error) {
    throw error
  }
}
