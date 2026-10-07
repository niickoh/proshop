import { Link } from 'react-router'
import { useCartStore } from '../store/cartStore'
import BagIcon from './BagIcon'

export default function EmptyCart() {
  const closeDrawer = useCartStore((s) => s.closeDrawer)

  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <BagIcon className="size-12 text-gray-400" />
      <p className="text-lg font-semibold text-gray-900">Tu carrito está vacío</p>
      <p className="text-sm text-gray-600">Explora el catálogo y agrega lo que más te guste.</p>
      <Link
        to="/comprar"
        onClick={closeDrawer}
        className="mt-2 flex min-h-11 items-center rounded-md bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Ir a comprar
      </Link>
    </div>
  )
}
