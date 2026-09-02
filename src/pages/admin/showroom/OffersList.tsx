// Pagina admin: lista offerte showroom con CRUD
import { useMemo, useState } from "react"
import OfferForm from "./OfferForm"
import OfferTable from "../../../components/admin/showroom/OfferTable"
import OfferFilters, {
  defaultOF,
  type OfferFilterState,
} from "../../../components/admin/showroom/OfferFilters"
import { createOffer, deleteOffer, updateOffer, useOffers, useProducts } from "../../../services/showroomApi"
import type { Offer } from "../../../types/showroom"

export default function OffersList() {
  const offers = useOffers()
  const products = useProducts()
  const [filters, setFilters] = useState<OfferFilterState>(defaultOF)
  const [editing, setEditing] = useState<Offer | null>(null)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const matching = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const t = today.getTime()
    return offers.filter((o) => {
      if (q && !o.title.toLowerCase().includes(q)) return false
      if (filters.activity !== "all" && o.activityCategory !== filters.activity) return false
      if (filters.furniture !== "all" && o.furnitureType !== filters.furniture) return false
      if (filters.status !== "all") {
        const s = new Date(o.startDate).getTime()
        const e = new Date(o.endDate + "T23:59:59").getTime()
        if (filters.status === "active" && (!o.active || t < s || t > e)) return false
        if (filters.status === "inactive" && o.active) return false
        if (filters.status === "upcoming" && !(o.active && t < s)) return false
        if (filters.status === "expired" && !(t > e)) return false
      }
      return true
    })
  }, [offers, filters])

  const onSave = async (data: Omit<Offer, "id" | "createdAt" | "updatedAt">, id?: string) => {
    setBusy(true)
    try {
      if (id) {
        await updateOffer(id, data)
        showToast("Offerta aggiornata")
      } else {
        await createOffer(data)
        showToast("Offerta creata")
      }
      setEditing(null)
      setCreating(false)
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (o: Offer) => {
    if (!window.confirm(`Eliminare "${o.title}"?`)) return
    setBusy(true)
    try {
      await deleteOffer(o.id)
      showToast("Offerta eliminata")
    } finally {
      setBusy(false)
    }
  }

  const onToggle = async (id: string, next: boolean) => {
    setBusy(true)
    try {
      await updateOffer(id, { active: next })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-[#1A1A18]">Offerte Showroom</h1>
          <p className="text-sm text-[#888580] mt-1">
            Crea promozioni e pacchetti dedicati ai clienti.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-[#B5965A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#9A7F48] transition-colors flex items-center gap-2"
        >
          <span>＋</span> Nuova offerta
        </button>
      </div>

      <OfferFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultOF)}
        total={offers.length}
        matching={matching.length}
      />

      <OfferTable
        offers={matching}
        products={products}
        onEdit={(o) => setEditing(o)}
        onDelete={onDelete}
        onToggle={onToggle}
      />

      {(creating || editing) && (
        <OfferForm
          initial={editing ?? undefined}
          busy={busy}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSave={onSave}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#1A1A18] text-white text-sm px-5 py-2.5 shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
