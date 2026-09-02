// hooks/useAdminAuth.ts — Protezione rotte Admin
//
// Fornisce:
//   - hook useAdminAuth(): stato utente + metodi
//   - componente <RequireAdmin />: wrapper che blocca la pagina se l'utente
//     NON ha ruolo "admin"
//
// MOCK / SVILUPPO:
// Attualmente simula un utente con ruolo "admin" perche' il progetto non
// integra ancora un vero sistema di login (JWT, OAuth ecc.). La funzione
// `getCurrentUser()` legge un flag nel localStorage:
//   - farcom-auth-role  → "admin" | "user" | (non impostato)
// Se non impostato, di default usiamo "admin" cosi il backoffice e' subito
// accessibile in sviluppo.
//
// 🔗 Per integrare un backend reale:
//   1. Al login salva il token JWT in httpOnly cookie (piu sicuro) o in memoria
//   2. Sostituisci il body di `getCurrentUser()` con una chiamata a
//      `/api/auth/me` che restituisce { id, email, role, ecc. }
//   3. Server-side: verifica SEMPRE il ruolo anche per ogni endpoint
//      (non fidarti mai solo del check client-side).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { Link } from "react-router-dom"

export type UserRole = "admin" | "user" | "guest"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

const AUTH_ROLE_KEY = "farcom-auth-role"
const AUTH_USER_KEY = "farcom-auth-user"

function getCurrentUser(): AuthUser {
  if (typeof window === "undefined") {
    return { id: "dev", name: "Admin", email: "admin@farcom.it", role: "admin" }
  }
  try {
    const role =
      (window.localStorage.getItem(AUTH_ROLE_KEY) as UserRole | null) ??
      "admin"
    const raw = window.localStorage.getItem(AUTH_USER_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AuthUser
      return { ...parsed, role: parsed.role ?? role }
    }
    return {
      id: "u-admin",
      name: "Ugo Farcom",
      email: "admin@farcom.it",
      role,
    }
  } catch {
    return {
      id: "u-admin",
      name: "Ugo Farcom",
      email: "admin@farcom.it",
      role: "admin",
    }
  }
}

interface AdminAuthContextValue {
  user: AuthUser
  isAdmin: boolean
  isLoading: boolean
  loginAs: (role: UserRole) => void
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => getCurrentUser())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simula il round trip verso /api/auth/me (120ms)
    const t = window.setTimeout(() => {
      setUser(getCurrentUser())
      setIsLoading(false)
    }, 120)
    return () => window.clearTimeout(t)
  }, [])

  const loginAs = useCallback((role: UserRole) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_ROLE_KEY, role)
    }
    setUser({
      id: "u-" + role,
      name: role === "admin" ? "Admin Demo" : "Utente Demo",
      email: `${role}@farcom.it`,
      role,
    })
  }, [])

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_ROLE_KEY)
      window.localStorage.removeItem(AUTH_USER_KEY)
    }
    setUser({
      id: "u-guest",
      name: "Ospite",
      email: "",
      role: "guest",
    })
  }, [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      isAdmin: user.role === "admin",
      isLoading,
      loginAs,
      logout,
    }),
    [user, isLoading, loginAs, logout],
  )

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) {
    // Fallback sicuro se il provider non è montato
    const u = getCurrentUser()
    return {
      user: u,
      isAdmin: u.role === "admin",
      isLoading: false,
      loginAs: () => {},
      logout: () => {},
    }
  }
  return ctx
}

// ============================================================
// Componente HOC-like: wrappa le rotte admin
// ============================================================

interface RequireAdminProps {
  children: ReactNode
  /** Testo / UI mostrata quando l'utente non è admin */
  fallback?: ReactNode
}

export function RequireAdmin({ children, fallback }: RequireAdminProps) {
  const { user, isAdmin, isLoading } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-[#888580]">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin" />
          Verifica autorizzazioni…
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    if (fallback) return <>{fallback}</>
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white border border-[#DDD9D0] p-8 space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-3xl">
            🔒
          </div>
          <div>
            <h2 className="font-display text-2xl font-light text-[#1A1A18] mb-2">
              Accesso riservato
            </h2>
            <p className="text-sm text-[#4A4A46] leading-relaxed">
              La sezione Showroom è accessibile solo agli utenti con ruolo
              amministratore.
            </p>
            {user.role === "guest" && (
              <p className="text-xs text-[#888580] mt-3">
                Il tuo ruolo attuale è{" "}
                <code className="bg-[#F7F5F0] px-1.5 py-0.5 rounded">
                  guest
                </code>
                . Se sei un amministratore, effettua il login.
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="bg-[#1B4332] text-white text-sm px-5 py-2.5 hover:bg-[#143326] transition-colors"
            >
              Torna alla home
            </Link>
            <Link
              to="/contatti"
              className="border border-[#DDD9D0] text-[#4A4A46] text-sm px-5 py-2.5 hover:bg-[#F7F5F0] transition-colors"
            >
              Contatta l&apos;amministratore
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
