import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import Button from '../../../shared/ui/Button'
import { cn } from '../../../shared/ui/cn'
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
      <dl className="text-sm text-slate-600 tabular-nums">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
      </dl>
      {savings > 0 && (
        <p className="text-sm font-medium text-emerald-600 tabular-nums">
          Ahorras {formatPrice(savings)}
        </p>
      )}
      <p className="text-xs font-medium text-slate-500">Envío: se calcula en el pago</p>

      <div
        className={cn(
          'space-y-3',
          variant === 'page' &&
            'fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-up backdrop-blur lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none',
        )}
      >
        <dl>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-base font-semibold text-slate-900">Total</dt>
            <dd className="text-lg font-bold text-slate-900 tabular-nums">
              {formatPrice(subtotal)}
            </dd>
          </div>
        </dl>
        <Button size="lg" fullWidth onClick={handleCheckout}>
          Comprar carrito
        </Button>
        <p className="text-center text-xs text-slate-500">
          Pago seguro · Cambios y devoluciones en 30 días
        </p>
      </div>

      {children}
    </section>
  )
}
