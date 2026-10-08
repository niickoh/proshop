import { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import Header from '../shared/components/Header/Header'
import CartDrawer from '../features/carrito/components/CartDrawer'
import AdminGuard from '../features/admin/AdminGuard'
import HomePage from './pages/HomePage'

const CatalogoPage = lazy(() => import('../features/catalogo/CatalogoPage'))
const ProductoDetallePage = lazy(() => import('../features/producto-detalle/ProductoDetallePage'))
const EncargarPage = lazy(() => import('../features/encargar/EncargarPage'))
const ContactoPage = lazy(() => import('./pages/ContactoPage'))
const CarritoPage = lazy(() => import('../features/carrito/CarritoPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const AdminLayout = lazy(() => import('../features/admin/AdminLayout'))
const AdminProductsPage = lazy(() => import('../features/admin/productos/pages/AdminProductsPage'))
const ProductFormPage = lazy(() => import('../features/admin/productos/pages/ProductFormPage'))

function Layout() {
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<p className="py-8">Cargando…</p>}>
          <Outlet />
        </Suspense>
      </main>
    </>
  )
}

// Data router: lo necesita `useBlocker` (aviso de cambios sin guardar en el panel).
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="comprar" element={<CatalogoPage />} />
      <Route path="comprar/:id" element={<ProductoDetallePage />} />
      <Route path="encargar" element={<EncargarPage />} />
      <Route path="contacto" element={<ContactoPage />} />
      <Route path="carrito" element={<CarritoPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      {/* Todas las rutas /admin/* pasan por AdminGuard */}
      <Route
        path="admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<Navigate to="productos" replace />} />
        <Route path="productos" element={<AdminProductsPage />} />
        <Route path="productos/nuevo" element={<ProductFormPage />} />
        <Route path="productos/:id/editar" element={<ProductFormPage />} />
      </Route>
    </Route>,
  ),
)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
