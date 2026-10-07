import { useLocation } from 'react-router'
import { useCartStore } from '../../features/carrito/store/cartStore'
import type { BuyNowState } from '../../features/carrito/types'
import { formatPrice } from '../../shared/utils/formatPrice'

const isBuyNowState = (state: unknown): state is BuyNowState =>
  typeof state === 'object' && state !== null && 'buyNow' in state

/** Placeholder: muestra lo que recibió (carrito o "Comprar ahora"). El pago llega en checkout.md. */
export default function CheckoutPage() {
  const state: unknown = useLocation().state
  const cartItems = useCartStore((s) => s.items)
  const buyNow = isBuyNowState(state) ? state.buyNow : undefined
  const items = buyNow ? [buyNow] : cartItems

  return (
    <section className="space-y-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      <p className="text-gray-600">{buyNow ? 'Compra directa' : 'Productos de tu carrito'}</p>
      {items.length === 0 ? (
        <p className="text-gray-700">No hay productos para comprar.</p>
      ) : (
        <ul aria-label="Productos a comprar" className="space-y-2">
          {items.map((item) => (
            <li key={`${item.productId}-${item.size}`} className="break-words text-gray-900">
              {item.name} · Talla {item.size} · {item.quantity} × {formatPrice(item.price)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
