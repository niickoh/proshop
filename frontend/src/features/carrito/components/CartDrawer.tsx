import { useId } from 'react'
import { Link } from 'react-router'
import { useCartDrawer } from '../hooks/useCartDrawer'
import { useCartStore } from '../store/cartStore'
import { selectItemCount } from '../store/selectors'
import CartItemList from './CartItemList'
import CartSummary from './CartSummary'

export default function CartDrawer() {
  const { isOpen, close, containerRef } = useCartDrawer()
  const count = useCartStore(selectItemCount)
  const hasItems = useCartStore((s) => s.items.length > 0)
  const titleId = useId()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-60">
      <div
        data-testid="cart-backdrop"
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-xl sm:max-w-md"
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-200 py-2 pr-2 pl-4">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            Tu carrito ({count})
          </h2>
          <button
            type="button"
            aria-label="Cerrar carrito"
            onClick={close}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <CartItemList />
        </div>

        {hasItems && (
          <div className="border-t border-gray-200 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <CartSummary variant="drawer">
              <Link
                to="/carrito"
                onClick={close}
                className="flex min-h-11 items-center justify-center rounded-md text-sm font-medium text-gray-900 underline hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              >
                Ver carrito completo
              </Link>
            </CartSummary>
          </div>
        )}
      </div>
    </div>
  )
}
