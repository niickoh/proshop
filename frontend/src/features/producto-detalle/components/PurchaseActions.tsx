import Button from '../../../shared/ui/Button'

type Props = {
  disabled: boolean
  onAddToCart: () => void
  onBuyNow: () => void
  /** id del mensaje "Selecciona una talla", cuando está visible. */
  describedBy?: string
}

// Alto mínimo en vez de fijo: en 360px el texto puede pasar a dos líneas sin cortarse.
const buttonClass = 'h-auto min-h-12 flex-1 px-4 py-2 leading-tight md:flex-none md:px-6'

/** Móvil: barra fija abajo. Desde md: en el flujo, bajo el selector de talla. */
export default function PurchaseActions({ disabled, onAddToCart, onBuyNow, describedBy }: Props) {
  return (
    <div
      role="group"
      aria-label="Acciones de compra"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] shadow-up backdrop-blur md:static md:z-auto md:border-0 md:bg-transparent md:shadow-none md:backdrop-blur-none"
    >
      <div className="flex gap-3 px-4 py-3 md:px-0 md:py-0">
        <Button
          variant="secondary"
          size="lg"
          onClick={onAddToCart}
          disabled={disabled}
          aria-disabled={disabled}
          aria-describedby={describedBy}
          className={buttonClass}
        >
          Agregar al carrito
        </Button>
        <Button
          size="lg"
          onClick={onBuyNow}
          disabled={disabled}
          aria-disabled={disabled}
          aria-describedby={describedBy}
          className={buttonClass}
        >
          Comprar ahora
        </Button>
      </div>
    </div>
  )
}
