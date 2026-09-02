// pages/admin/showroom/ProductsList.tsx
// Pagina lista prodotti Showroom:
// - Barra KPI (totali, attivi, in offerta, valore catalogo)
// - Filtri (ProductFilters)
// - Tabella prodotti (ProductTable) con ordinamento e paginazione
// - Pulsante "+ Nuovo prodotto" per aprire il form in modale
// - Modale <ProductForm /> integrato nella pagina stessa per
//   creare / modificare prodotti (piu veloce di una rotta separata)

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import ProductFilters, {
  defaultProductFilters,
  type ProductFilterState,
} from "../../../components/admin/showroom/ProductFilters"
import ProductTable from "../../../components/admin/showroom/ProductTable"
import ProductForm from "./ProductForm"
import Loading from "../../../components/Loading"
import {
  computeEffectivePrice,
  createProduct,
  deleteProduct,
  SHOWROOM_CATEGORIES,
  updateProduct,
  useShowroomOffers,
  useShowroomProducts,
  type Product,
} from "../../../services/showroomApi"
import { RequireAdmin } from "../../../hooks/useAdminAuth"

type ToastState = {
  kind: "ok" | "warn" | "err"
  msg: string
} | null

export default function ProductsList() {
  return (
    <RequireAdmin>
      <ProductsListInner />
    </RequireAdmin>
  )
}

function ProductsListInner() {
  const navigate = useNavigate()
  const products = useShowroomProducts()
  const offers = useShowroomOffers()

  const [filters, setFilters] = useState<ProductFilterState>(defaultProductFilters)
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)

  const showToast = (t: Exclude<ToastState, null>) => {
    setToast(t)
    window.setTimeout(() => setToast(null), 3200)
  }

  // Applicazione filtri lato client
  const matching = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    return products.filter((p) => {
      if (filters.category !== "all" && p.category !== filters.category)
        return false
      if (filters.offerStatus === "active" && !p.active) return false
      if (filters.offerStatus === "inactive" && p.active) return false
      if (filters.offerStatus === "in_offer") {
        const eff = computeEffectivePrice(p, offers)
        if (eff.appliedSource === "base") return false
      }
      if (filters.offerStatus === "no_offer") {
        const eff = computeEffectivePrice(p, offers)
        if (eff.appliedSource !== "base") return false
      }
      if (q) {
        const hay =
          p.name.toLowerCase() +
          " " +
          p.description.toLowerCase() +
          " " +
          p.sku.toLowerCase() +
          " " +
          p.category.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [products, offers, filters])

  // KPI
  const kpis = useMemo(() => {
    const totalValue = products.reduce((sum, p) => {
      const eff = computeEffectivePrice(p, offers)
      return sum + (eff.finalPrice > 0 ? eff.finalPrice : p.basePrice)
    }, 0)
    const inOffer = products.filter(
      (p) => computeEffectivePrice(p, offers).appliedSource !== "base",
    ).length
    return {
      total: products.length,
      active: products.filter((p) => p.active).length,
      inOffer,
      value: totalValue,
    }
  }, [products, offers])

  // Azioni CRUD
  const handleSave = async (
    data: Omit<Product, "id" | "createdAt" | "updatedAt">,
    id?: string,
  ) => {
    setBusy(true)
    try {
      if (id) {
        const res = await updateProduct(id, data)
        if (res)
          showToast({
            kind: "ok",
            msg: `✓ Prodotto "${res.name}" aggiornato con successo`,
          })
      } else {
        const res = await createProduct(data)
        showToast({
          kind: "ok",
          msg: `✓ Nuovo prodotto "${res.name}" creato`,
        })
      }
      setShowForm(false)
      setEditing(null)
    } catch {
      showToast({
        kind: "err",
        msg: "❌ Errore durante il salvataggio. Riprova.",
      })
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Eliminare il prodotto "${p.name}"?`)) return
    setBusy(true)
    try {
      const ok = await deleteProduct(p.id)
      if (ok)
        showToast({
          kind: "ok",
          msg: `✓ Prodotto "${p.name}" eliminato`,
        })
      else
        showToast({
          kind: "warn",
          msg: "⚠ Prodotto non trovato, ricarica la pagina",
        })
    } catch {
      showToast({ kind: "err", msg: "❌ Errore durante l'eliminazione" })
    } finally {
      setBusy(false)
    }
  }

  const handleToggleActive = async (id: string, next: boolean) => {
    setBusy(true)
    try {
      const res = await updateProduct(id, { active: next })
      if (res) {
        showToast({
          kind: "ok",
          msg: next
            ? `✓ "${res.name}" ora è attivo`
            : `✓ "${res.name}" disattivato`,
        })
      }
    } catch {
      showToast({
        kind: "err",
        msg: "❌ Impossibile cambiare lo stato",
      })
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
              onClick={() => navigate("/admin/showroom/offers")}
              className="text-xs text-[#888580] hover:text-[#1B4332] transition-colors"
            >
              ← Showroom / Offerte
            </button>
          </div>
          <h1 className="font-display text-3xl font-light text-[#1A1A18]">
            Prodotti Showroom
          </h1>
          <p className="mt-0.5 text-sm text-[#888580]">
            {products.length} prodotti totali nel catalogo
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="bg-[#1B4332] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#143326] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {busy ? <Loading size="sm" /> : null}
          ＋ Nuovo prodotto
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Prodotti catalogo",
            value: String(kpis.total),
            sub: "attivi + inattivi",
            color: "#1B4332",
          },
          {
            label: "Prodotti attivi",
            value: String(kpis.active),
            sub: `${kpis.total > 0 ? Math.round((kpis.active / kpis.total) * 100) : 0}% del totale`,
            color: "#1A1A18",
          },
          {
            label: "In offerta",
            value: String(kpis.inOffer),
            sub: "con sconto attivo oggi",
            color: "#B5965A",
          },
          {
            label: "Valore catalogo",
            value: `€ ${kpis.value.toLocaleString("it-IT", { maximumFractionDigits: 0 })}`,
            sub: "somma prezzi finali",
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
      <ProductFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultProductFilters)}
        categories={SHOWROOM_CATEGORIES}
        total={products.length}
        matching={matching.length}
      />

      {/* Tabella */}
      <ProductTable
        products={matching}
        offers={offers}
        onEdit={(p) => {
          setEditing(p)
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
        <ProductForm
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
