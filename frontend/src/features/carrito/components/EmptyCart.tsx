import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '../../../shared/ui/cn'
import { buttonClass } from '../../../shared/ui/styles'
import { useCartStore } from '../store/cartStore'

export default function EmptyCart() {
  const closeDrawer = useCartStore((s) => s.closeDrawer)

  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <ShoppingBag aria-hidden="true" size={28} strokeWidth={1.75} />
      </span>
      <p className="text-lg font-semibold text-slate-900">Tu carrito está vacío</p>
      <p className="text-sm text-slate-500">Explora el catálogo y agrega lo que más te guste.</p>
      <Link to="/comprar" onClick={closeDrawer} className={cn(buttonClass(), 'mt-2')}>
        Ir a comprar
      </Link>
    </div>
  )
}
