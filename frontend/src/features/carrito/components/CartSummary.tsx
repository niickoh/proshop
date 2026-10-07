import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { useNavigate } from 'react-router'
import { formatPrice } from '../../../shared/utils/formatPrice'
import { useCartStore } from '../store/cartStore'
import { selectSavings, selectSubtotal } from '../store/selectors'

type Props = {
  /** En la página, el total y el botón van en una barra fija abajo en móvil. */
  variant: 'drawer' | 'page'
  /** Contenido extra bajo el botón (ej. "Ver carrito completo" en el drawer). */
  children?: ReactNode
}

export default function CartSummary({ variant, children }: Props) {
  const subtotal = useCartStore(selectSubtotal)
  const savings = useCartStore(selectSavings)
  const closeDrawer = useCartStore((s) => s.closeDrawer)
  const navigate = useNavigate()

  const handleCheckout = () => {
    closeDrawer()
    navigate('/checkout')
  }

  return (
    <section aria-label="Resumen de compra" className="space-y-3">
      <dl className="text-sm text-gray-700">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
      </dl>
      {savings > 0 && (
        <p className="text-sm font-medium text-green-700">Ahorras {formatPrice(savings)}</p>
      )}
      <p className="text-sm text-gray-600">Envío: se calcula en el pago</p>

      <div
        className={clsx(
          'space-y-2',
          variant === 'page' &&
            'fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0',
        )}
      >
        <dl>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-base font-semibold text-gray-900">Total</dt>
            <dd className="text-xl font-bold text-gray-900">{formatPrice(subtotal)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={handleCheckout}
          className="min-h-11 w-full rounded-md bg-brand-600 px-6 text-base font-semibold text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Comprar carrito
        </button>
        <p className="text-center text-xs text-gray-600">
          Pago seguro · Cambios y devoluciones en 30 días
        </p>
      </div>

      {children}
    </section>
  )
}
