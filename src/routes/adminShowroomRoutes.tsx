// Rotte area admin showroom (guard + sub-pagine)
import { Navigate, Outlet } from "react-router-dom"
import { RequireAdmin } from "../hooks/useAdminAuth"
import ProductsList from "../pages/admin/showroom/ProductsList"
import OffersList from "../pages/admin/showroom/OffersList"

export function ShowroomGuard() {
  return (
    <RequireAdmin>
      <Outlet />
    </RequireAdmin>
  )
}

export function ShowroomIndexRedirect() {
  return <Navigate to="/admin/showroom/products" replace />
}

export { ProductsList, OffersList }
