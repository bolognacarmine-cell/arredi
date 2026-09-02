// Pagina admin: lista prodotti showroom con CRUD
import { useMemo, useState } from "react"
import ProductForm from "./ProductForm"
import ProductTable from "../../../components/admin/showroom/ProductTable"
import ProductFilters, {
  defaultPF,
  type ProductFilterState,
} from "../../../components/admin/showroom/ProductFilters"
import {
  createProduct,
  deleteProduct,
  updateProduct,
  useOffers,
  useProducts,
  computeEffectivePrice,
} from "../../../services/showroomApi"
import type { Product } from "../../../types/showroom"

export default function ProductsList() {
  const all = useProducts()
  const offers = useOffers()
  const [filters, setFilters] = useState<ProductFilterState>(defaultPF)
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const matching = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    return all.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q))
        return false
      if (filters.activity !== "all" && p.activityCategory !== filters.activity) return false
      if (filters.furniture !== "all" && p.furnitureType !== filters.furniture) return false
      if (filters.offerStatus === "active" && !p.active) return false
      if (filters.offerStatus === "inactive" && p.active) return false
      if (filters.offerStatus === "in_offer") {
        const eff = computeEffectivePrice(p, offers)
        if (eff.savings <= 0) return false
      }
      return true
    })
  }, [all, offers, filters])

  const onSave = async (
    data: Omit<Product, "id" | "createdAt" | "updatedAt" | "slug"> & { slug?: string },
    id?: string,
  ) => {
    setBusy(true)
    try {
      if (id) {
        await updateProduct(id, data)
        showToast("Prodotto aggiornato")
      } else {
        await createProduct(data)
        showToast("Prodotto creato")
      }
      setEditing(null)
      setCreating(false)
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (p: Product) => {
    if (!window.confirm(`Eliminare "${p.name}"?`)) return
    setBusy(true)
    try {
      await deleteProduct(p.id)
      showToast("Prodotto eliminato")
    } finally {
      setBusy(false)
    }
  }

  const onToggle = async (id: string, next: boolean) => {
    setBusy(true)
    try {
      await updateProduct(id, { active: next })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-[#1A1A18]">Prodotti Showroom</h1>
          <p className="text-sm text-[#888580] mt-1">
            Gestisci il listino prodotti visibili nel catalogo pubblico.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-[#1B4332] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#143326] transition-colors flex items-center gap-2"
        >
          <span>＋</span> Nuovo prodotto
        </button>
      </div>

      <ProductFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultPF)}
        total={all.length}
        matching={matching.length}
      />

      <ProductTable
        products={matching}
        offers={offers}
        onEdit={(p) => setEditing(p)}
        onDelete={onDelete}
        onToggle={onToggle}
      />

      {(creating || editing) && (
        <ProductForm
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
