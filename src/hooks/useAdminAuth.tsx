import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { getApiUrl } from "../lib/apiConfig"

type Role = "admin" | "user" | "guest"
export interface AdminUser {
  id: string
  email: string
  name: string
  role: Role
}

type AuthErrorKind = "401" | "network" | "server" | null

interface Ctx {
  user: AdminUser | null
  isAdmin: boolean
  isLoading: boolean
  isAuthenticated: boolean
  authError: AuthErrorKind
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}
const AC = createContext<Ctx | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<AuthErrorKind>(null)
  const navigate = useNavigate()

  const checkAuth = async () => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const apiUrl = getApiUrl('/api/admin/me')
      console.log('[Auth Check] Fetching from:', apiUrl)

      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })

      console.log('[Auth Check] Response status:', response.status)

      if (response.status === 401 || response.status === 403) {
        console.log('[Auth Check] User not authenticated (401/403)')
        setUser(null)
        setAuthError(response.status === 401 ? "401" : "server")
        return
      }

      if (!response.ok) {
        console.warn('[Auth Check] Auth check failed:', response.status)
        setUser(null)
        setAuthError(response.status >= 500 ? "server" : "network")
        return
      }

      const data = await response.json()

      if (data.success && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.name || 'Admin',
          role: data.user.role || 'admin',
        })
        setAuthError(null)
      } else {
        setUser(null)
        setAuthError("server")
      }
    } catch (error) {
      console.warn('[Auth Check] Errore:', error)
      setUser(null)
      setAuthError("network")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const apiUrl = getApiUrl('/api/admin/login')
      console.log('[Login] Attempting login to:', apiUrl)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      console.log('[Login] Response status:', response.status)
      const data = await response.json()
      console.log('[Login] Response data:', data)

      if (data.success) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
        })
        setAuthError(null)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message || 'Credenziali non valide' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Errore di connessione al server. Riprova.' }
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
      setAuthError(null)
      navigate('/admin/login', { replace: true })
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
      authError,
      login,
      logout,
      checkAuth,
    }),
    [user, isLoading, authError],
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
      authError: null,
      login: async () => ({ success: false, message: 'Context not available' }),
      logout: async () => {},
      checkAuth: async () => {},
    }
  }
  return ctx
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isLoading, user, authError, checkAuth } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user === null) {
      const t = window.setTimeout(() => {
        navigate('/admin/login', { replace: true, state: { reason: authError } })
      }, 0)
      return () => window.clearTimeout(t)
    }
  }, [user, isLoading, navigate, authError])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#888580] bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin" />
          <span>Verifica autorizzazioni…</span>
        </div>
      </div>
    )
  }

  if (authError === "401") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
        <div className="max-w-md w-full border border-[#DDD9D0] bg-white p-6 text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-lg font-medium text-[#1A1A18] mb-2">Sessione scaduta</h2>
          <p className="text-sm text-[#888580] mb-5">
            Effettua nuovamente l'accesso per continuare.
          </p>
          <button
            onClick={() => navigate('/admin/login', { replace: true })}
            className="bg-[#1B4332] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#143326] transition-colors"
          >
            Vai al login
          </button>
        </div>
      </div>
    )
  }

  if (authError === "network" || authError === "server") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
        <div className="max-w-md w-full border border-amber-200 bg-amber-50 p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-medium text-[#1A1A18] mb-2">
            {authError === "network" ? "Errore di connessione" : "Errore del server"}
          </h2>
          <p className="text-sm text-[#888580] mb-5">
            Impossibile verificare i permessi. Riprovare.
          </p>
          <button
            onClick={checkAuth}
            className="bg-[#1B4332] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#143326] transition-colors mr-2"
          >
            Riprova
          </button>
          <button
            onClick={() => navigate('/admin/login', { replace: true })}
            className="border border-[#DDD9D0] px-5 py-2.5 text-sm text-[#4A4A46] hover:bg-[#EAE7E0] transition-colors"
          >
            Torna al login
          </button>
        </div>
      </div>
    )
  }

  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#888580] bg-[var(--background)]">
        <span className="w-4 h-4 border-2 border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin mr-2" />
        Reindirizzamento al login…
      </div>
    )
  }

  return <>{children}</>
}
