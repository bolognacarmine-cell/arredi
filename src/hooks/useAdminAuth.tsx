// Hook mock: controllo ruolo admin
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

type Role = "admin" | "user" | "guest"
export interface AdminUser {
  id: string
  name: string
  role: Role
}

interface Ctx {
  user: AdminUser
  isAdmin: boolean
  isLoading: boolean
  loginAs: (r: Role) => void
}
const AC = createContext<Ctx | null>(null)

const LS = "farcom-admin-role-v2"

function load(): AdminUser {
  const role = (typeof window !== "undefined"
    ? (window.localStorage.getItem(LS) as Role | null)
    : null) ?? "admin"
  return { id: "u1", name: "Admin", role }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser>(() => load())
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 120)
    return () => clearTimeout(t)
  }, [])
  const value = useMemo<Ctx>(
    () => ({
      user,
      isAdmin: user.role === "admin",
      isLoading,
      loginAs: (r) => {
        window.localStorage.setItem(LS, r)
        setUser({ ...load(), role: r })
      },
    }),
    [user, isLoading],
  )
  return <AC.Provider value={value}>{children}</AC.Provider>
}

export function useAdminAuth(): Ctx {
  const ctx = useContext(AC)
  if (!ctx) {
    const u = load()
    return { user: u, isAdmin: u.role === "admin", isLoading: false, loginAs: () => {} }
  }
  return ctx
}

// Wrapper per bloccare rotte non-admin
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth()
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#888580]">
        <span className="w-4 h-4 border-2 border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin mr-2" />
        Verifica autorizzazioni…
      </div>
    )
  }
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white border border-[#DDD9D0] p-8">
          <div className="text-5xl mb-3">🔒</div>
          <h2 className="font-display text-2xl font-light text-[#1A1A18] mb-2">Accesso riservato</h2>
          <p className="text-sm text-[#4A4A46] mb-5">
            Area dedicata agli amministratori.
          </p>
          <a
            href="/"
            className="bg-[#1B4332] text-white text-sm px-5 py-2.5 hover:bg-[#143326] transition-colors"
          >
            Torna alla home
          </a>
        </div>
      </div>
    )
  }
  return <>{children}</>
}
