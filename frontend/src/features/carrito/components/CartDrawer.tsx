import { useId } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '../../../shared/ui/cn'
import IconButton from '../../../shared/ui/IconButton'
import { buttonClass } from '../../../shared/ui/styles'
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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-xl sm:max-w-md sm:rounded-l-2xl"
      >
        <div className="flex items-center justify-between gap-2 py-3 pr-2 pl-4 sm:pl-6">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            Tu carrito ({count})
          </h2>
          <IconButton aria-label="Cerrar carrito" onClick={close}>
            <X aria-hidden="true" size={20} strokeWidth={1.75} />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <CartItemList />
        </div>

        {hasItems && (
          <div className="border-t border-slate-100 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
            <CartSummary variant="drawer">
              <Link to="/carrito" onClick={close} className={cn(buttonClass('ghost'), 'w-full')}>
                Ver carrito completo
              </Link>
            </CartSummary>
          </div>
        )}
      </div>
    </div>
  )
}
