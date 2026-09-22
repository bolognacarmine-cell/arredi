// Hook reale per autenticazione admin con sessione server-side
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"

type Role = "admin" | "user" | "guest"
export interface AdminUser {
  id: string
  email: string
  name: string
  role: Role
}

interface Ctx {
  user: AdminUser | null
  isAdmin: boolean
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}
const AC = createContext<Ctx | null>(null)

// Get API base URL - use relative paths in same-origin, absolute when VITE_API_BASE_URL is set
const getApiUrl = (path: string) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (apiBaseUrl) {
    return `${apiBaseUrl.replace(/\/+$/, '')}${path}`
  }
  return path // Use relative path for same-origin
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const checkAuth = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/me'), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      if (data.success && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.name || 'Admin',
          role: data.user.role || 'admin',
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Don't set user to null on network errors - keep existing state
      // Only set null on explicit 401 responses
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(getApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
        })
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message || 'Login failed' }
      }
    } catch (error) {
      return { success: false, message: 'An error occurred during login' }
    }
  }

  const logout = async () => {
    try {
      await fetch(getApiUrl('/api/admin/logout'), {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      navigate('/admin/login')
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      user,
      isAdmin: user?.role === "admin",
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      checkAuth,
    }),
    [user, isLoading],
  )
  return <AC.Provider value={value}>{children}</AC.Provider>
}

export function useAdminAuth(): Ctx {
  const ctx = useContext(AC)
  if (!ctx) {
    return {
      user: null,
      isAdmin: false,
      isAuthenticated: false,
      isLoading: false,
      login: async () => ({ success: false, message: 'Context not available' }),
      logout: async () => {},
      checkAuth: async () => {},
    }
  }
  return ctx
}

// Wrapper per bloccare rotte non-admin
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Only redirect if we're definitely not authenticated (user is null) and not loading
    // Don't redirect on network errors - keep existing state
    if (!isLoading && user === null) {
      navigate('/admin/login')
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#888580]">
        <span className="w-4 h-4 border-2 border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin mr-2" />
        Verifica autorizzazioni…
      </div>
    )
  }
  if (user === null) {
    return null // Will redirect via useEffect
  }
  return <>{children}</>
}
