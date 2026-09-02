// pages/admin/showroom/OffersList.tsx
// Pagina lista Offerte Promozionali:
// - KPI (offerte attive, in arrivo, scadute, prodotti coperti)
// - Filtri (OfferFilters)
// - Tabella (OfferTable) con ordinamento e paginazione
// - + Nuova Offerta → modale <OfferForm />

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import OfferFilters, {
  defaultOfferFilters,
  type OfferFilterState,
} from "../../../components/admin/showroom/OfferFilters"
import OfferTable from "../../../components/admin/showroom/OfferTable"
import OfferForm from "./OfferForm"
import Loading from "../../../components/Loading"
import {
  createOffer,
  deleteOffer,
  updateOffer,
  useShowroomOffers,
  useShowroomProducts,
  type Offer,
} from "../../../services/showroomApi"
import { RequireAdmin } from "../../../hooks/useAdminAuth"

type ToastState = {
  kind: "ok" | "warn" | "err"
  msg: string
} | null

export default function OffersList() {
  return (
    <RequireAdmin>
      <OffersListInner />
    </RequireAdmin>
  )
}

function OffersListInner() {
  const navigate = useNavigate()
  const offers = useShowroomOffers()
  const products = useShowroomProducts()

  const [filters, setFilters] = useState<OfferFilterState>(defaultOfferFilters)
  const [editing, setEditing] = useState<Offer | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)

  const showToast = (t: Exclude<ToastState, null>) => {
    setToast(t)
    window.setTimeout(() => setToast(null), 3200)
  }

  const matching = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const now = today.getTime()
    const q = filters.q.trim().toLowerCase()
    return offers.filter((o) => {
      const start = new Date(o.startDate).getTime()
      const end = new Date(o.endDate + "T23:59:59").getTime()
      if (filters.active === "active" && !o.active) return false
      if (filters.active === "inactive" && o.active) return false
      if (filters.active === "upcoming" && !(now < start && o.active)) return false
      if (filters.active === "expired" && !(now > end)) return false
      if (q) {
        const hay =
          o.title.toLowerCase() +
          " " +
          o.description.toLowerCase() +
          " " +
          o.badgeText.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [offers, filters])

  const kpis = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const now = today.getTime()
    let active = 0
    let upcoming = 0
    let expired = 0
    const coveredIds = new Set<string>()
    for (const o of offers) {
      const s = new Date(o.startDate).getTime()
      const e = new Date(o.endDate + "T23:59:59").getTime()
      if (o.active) {
        if (now >= s && now <= e) active++
        if (now < s) upcoming++
      }
      if (now > e) expired++
      for (const pid of o.productIds) coveredIds.add(pid)
    }
    return {
      total: offers.length,
      active,
      upcoming,
      expired,
      coveredProducts: coveredIds.size,
    }
  }, [offers])

  const handleSave = async (
    data: Omit<Offer, "id" | "createdAt" | "updatedAt">,
    id?: string,
  ) => {
    setBusy(true)
    try {
      if (id) {
        const res = await updateOffer(id, data)
        if (res)
          showToast({
            kind: "ok",
            msg: `✓ Offerta "${res.title}" aggiornata`,
          })
      } else {
        const res = await createOffer(data)
        showToast({ kind: "ok", msg: `✓ Offerta "${res.title}" creata` })
      }
      setShowForm(false)
      setEditing(null)
    } catch {
      showToast({
        kind: "err",
        msg: "❌ Errore nel salvataggio dell'offerta",
      })
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (o: Offer) => {
    if (!window.confirm(`Eliminare l'offerta "${o.title}"?`)) return
    setBusy(true)
    try {
      const ok = await deleteOffer(o.id)
      if (ok)
        showToast({ kind: "ok", msg: `✓ Offerta "${o.title}" eliminata` })
    } catch {
      showToast({ kind: "err", msg: "❌ Errore nell'eliminazione" })
    } finally {
      setBusy(false)
    }
  }

  const handleToggleActive = async (id: string, next: boolean) => {
    setBusy(true)
    try {
      const res = await updateOffer(id, { active: next })
      if (res)
        showToast({
          kind: "ok",
          msg: next
            ? `✓ "${res.title}" attivata`
            : `✓ "${res.title}" disattivata`,
        })
    } catch {
      showToast({ kind: "err", msg: "❌ Impossibile cambiare stato" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <button
              type="button"
              onClick={() => navigate("/admin/showroom/products")}
              className="text-xs text-[#888580] hover:text-[#1B4332] transition-colors"
            >
              ← Prodotti
            </button>
          </div>
          <h1 className="font-display text-3xl font-light text-[#1A1A18]">
            Offerte e promozioni
          </h1>
          <p className="mt-0.5 text-sm text-[#888580]">
            Crea offerte su uno o più prodotti, con % o sconto fisso e finestra
            temporale
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="bg-[#B5965A] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#a07f46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {busy ? <Loading size="sm" /> : null}
          ＋ Nuova offerta
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          {
            label: "Totali",
            value: String(kpis.total),
            sub: "offerte create",
            color: "#1B4332",
          },
          {
            label: "Attive oggi",
            value: String(kpis.active),
            sub: "in corso",
            color: "#1A1A18",
          },
          {
            label: "In partenza",
            value: String(kpis.upcoming),
            sub: "prossimamente",
            color: "#B5965A",
          },
          {
            label: "Scadute",
            value: String(kpis.expired),
            sub: "periodo concluso",
            color: "#888580",
          },
          {
            label: "Prodotti in promozione",
            value: String(kpis.coveredProducts),
            sub: "su tutti i cataloghi",
            color: "#4A4A46",
          },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-[#DDD9D0] p-5">
            <div className="text-[10px] text-[#888580] uppercase tracking-widest mb-2">
              {k.label}
            </div>
            <div
              className="font-display text-3xl font-light tabular-nums"
              style={{ color: k.color }}
            >
              {k.value}
            </div>
            <div className="text-[#888580] text-xs mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filtri */}
      <OfferFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultOfferFilters)}
        total={offers.length}
        matching={matching.length}
      />

      {/* Tabella */}
      <OfferTable
        offers={matching}
        products={products}
        onEdit={(o) => {
          setEditing(o)
          setShowForm(true)
        }}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded shadow-lg border text-sm animate-fade-in ${
            toast.kind === "ok"
              ? "bg-[#1B4332] text-white border-[#1B4332]"
              : toast.kind === "warn"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Form modale */}
      {showForm && (
        <OfferForm
          initial={editing ?? undefined}
          onCancel={() => {
            setShowForm(false)
            setEditing(null)
          }}
          onSave={handleSave}
          busy={busy}
        />
      )}
    </div>
  )
}
