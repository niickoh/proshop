import { useId } from 'react'
import { clsx } from 'clsx'
import { Link } from 'react-router'
import CartItemList from './components/CartItemList'
import CartSummary from './components/CartSummary'
import { useCartStore } from './store/cartStore'

export default function CarritoPage() {
  const hasItems = useCartStore((s) => s.items.length > 0)
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      // En móvil deja espacio para la barra fija con el total.
      className={clsx('space-y-4 pt-6', hasItems ? 'pb-48 lg:pb-8' : 'pb-8')}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 id={titleId} className="text-2xl font-bold text-gray-900">
          Tu carrito
        </h1>
        <Link
          to="/comprar"
          className="flex min-h-11 items-center rounded-md text-sm font-medium text-gray-700 underline hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Seguir comprando
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-start lg:gap-8">
        <div className="min-w-0 lg:col-span-2">
          <CartItemList />
        </div>
        {hasItems && (
          <div className="rounded-md border border-gray-200 p-4 lg:sticky lg:top-20">
            <CartSummary variant="page" />
          </div>
        )}
      </div>
    </section>
  )
}
