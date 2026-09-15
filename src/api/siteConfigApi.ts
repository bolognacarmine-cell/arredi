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

const getApiUrl = (path: string) => {
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/+$/, '')}${path}`
  }
  return path
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (!isApiAvailable) {
    throw new Error("API not available")
  }

  try {
    const response = await fetch(getApiUrl('/api/site-config'), {
      credentials: 'include',
    })
    const result = await response.json()

    if (result._id) {
      return result
    }

    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || result.message || "Failed to fetch site config")
  } catch (error) {
    throw error
  }
}

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<SiteConfig> {
  if (!isApiAvailable) {
    throw new Error("API not available")
  }

  try {
    const response = await fetch(getApiUrl('/api/site-config'), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result._id) {
      return result
    }

    if (result.success) {
      return result.data
    }

    throw new Error(result.error?.message || result.message || "Failed to update site config")
  } catch (error) {
    throw error
  }
}
