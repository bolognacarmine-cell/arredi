// Use relative paths for same-origin, absolute when VITE_API_BASE_URL is set for cross-origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

const getApiUrl = (path: string) => {
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/+$/, '')}${path}`
  }
  return path // Use relative path for same-origin
}

export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(getApiUrl('/api/admin/users'), {
      credentials: 'include',
    })
    const result = await response.json()

    if (result.success && Array.isArray(result.data)) {
      return result.data
    }

    throw new Error(result.message || "Failed to fetch users")
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    const response = await fetch(getApiUrl(`/api/admin/users/${id}`), {
      method: "DELETE",
      credentials: 'include',
    })

    const result = await response.json()

    if (result.success) {
      return
    }

    throw new Error(result.error?.message || result.message || "Failed to delete user")
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}