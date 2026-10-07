import { ShoppingBag } from 'lucide-react'
import Badge from '../../../shared/ui/Badge'
import IconButton from '../../../shared/ui/IconButton'
import { CART_BUTTON_ID } from '../hooks/useCartDrawer'
import { useCartStore } from '../store/cartStore'
import { selectItemCount } from '../store/selectors'

const cartLabel = (count: number) =>
  count === 0 ? 'Carrito vacío' : `Carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`

export default function CartButton({ className }: { className?: string }) {
  const count = useCartStore(selectItemCount)
  const openDrawer = useCartStore((s) => s.openDrawer)

  return (
    <IconButton
      id={CART_BUTTON_ID}
      aria-label={cartLabel(count)}
      aria-haspopup="dialog"
      onClick={openDrawer}
      className={className}
    >
      <ShoppingBag aria-hidden="true" size={20} strokeWidth={1.75} />
      {count > 0 && (
        // key: se vuelve a montar al cambiar la cantidad para repetir la animación.
        <Badge
          key={count}
          tone="brand"
          aria-hidden="true"
          className="absolute top-0.5 right-0 h-5 min-w-5 justify-center px-1 leading-none motion-safe:animate-badge-pop"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </IconButton>
  )
}
