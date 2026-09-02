// routes/adminShowroomRoutes.tsx
//
// Helper componenti per registrare le rotte Admin Showroom.
// Modo d'uso in App.tsx (dentro la <Route path="/admin" element={<AdminLayout />}>):
//
//   <Route path="showroom" element={<ShowroomGuard />}>
//     <Route index element={<ShowroomIndexRedirect />} />
//     <Route path="products" element={<ProductsList />} />
//     <Route path="offers" element={<OffersList />} />
//   </Route>

import { Navigate, Outlet } from "react-router-dom"
import { RequireAdmin } from "../hooks/useAdminAuth"
import ProductsList from "../pages/admin/showroom/ProductsList"
import OffersList from "../pages/admin/showroom/OffersList"

export { ProductsList, OffersList }

/**
 * Wrapper di protezione + Outlet per il gruppo /admin/showroom/*.
 * Blocca utenti non-admin.
 */
export function ShowroomGuard() {
  return (
    <RequireAdmin>
      <Outlet />
    </RequireAdmin>
  )
}

/**
 * /admin/showroom  →  /admin/showroom/products
 */
export function ShowroomIndexRedirect() {
  return <Navigate to="products" replace />
}
