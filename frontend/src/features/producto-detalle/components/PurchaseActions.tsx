import { clsx } from 'clsx'

type Props = {
  disabled: boolean
  onAddToCart: () => void
  onBuyNow: () => void
  /** id del mensaje "Selecciona una talla", cuando está visible. */
  describedBy?: string
}

const buttonBase =
  'min-h-11 flex-1 rounded-md px-4 py-2 text-sm font-semibold break-words focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-6 md:text-base'

/** Móvil: barra fija abajo. Desde md: en el flujo, bajo el selector de talla. */
export default function PurchaseActions({ disabled, onAddToCart, onBuyNow, describedBy }: Props) {
  return (
    <div
      role="group"
      aria-label="Acciones de compra"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:static md:z-auto md:border-0 md:bg-transparent"
    >
      <div className="flex gap-2 px-4 py-3 md:px-0 md:py-0">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={disabled}
          aria-disabled={disabled}
          aria-describedby={describedBy}
          className={clsx(
            buttonBase,
            'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-gray-900',
          )}
        >
          Agregar al carrito
        </button>
        <button
          type="button"
          onClick={onBuyNow}
          disabled={disabled}
          aria-disabled={disabled}
          aria-describedby={describedBy}
          className={clsx(
            buttonBase,
            'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-600',
          )}
        >
          Comprar ahora
        </button>
      </div>
    </div>
  )
}
