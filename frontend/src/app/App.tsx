import { lazy, Suspense } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import Header from '../shared/components/Header/Header'
import CartDrawer from '../features/carrito/components/CartDrawer'
import HomePage from './pages/HomePage'

const CatalogoPage = lazy(() => import('../features/catalogo/CatalogoPage'))
const ProductoDetallePage = lazy(() => import('../features/producto-detalle/ProductoDetallePage'))
const EncargarPage = lazy(() => import('../features/encargar/EncargarPage'))
const ContactoPage = lazy(() => import('./pages/ContactoPage'))
const CarritoPage = lazy(() => import('../features/carrito/CarritoPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="comprar" element={<CatalogoPage />} />
            <Route path="comprar/:id" element={<ProductoDetallePage />} />
            <Route path="encargar" element={<EncargarPage />} />
            <Route path="contacto" element={<ContactoPage />} />
            <Route path="carrito" element={<CarritoPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
