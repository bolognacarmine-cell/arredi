import { getApiUrl } from '../lib/apiConfig'

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
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