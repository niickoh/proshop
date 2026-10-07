import { useId } from 'react'
import { Link } from 'react-router'
import Card from '../../shared/ui/Card'
import { cn } from '../../shared/ui/cn'
import { buttonClass } from '../../shared/ui/styles'
import CartItemList from './components/CartItemList'
import CartSummary from './components/CartSummary'
import { useCartStore } from './store/cartStore'

export default function CarritoPage() {
  const hasItems = useCartStore((s) => s.items.length > 0)
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      // En móvil deja espacio para la barra fija con el total.
      className={cn('space-y-6 pt-8 md:pt-12', hasItems ? 'pb-48 lg:pb-8' : 'pb-8')}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 id={titleId} className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Tu carrito
        </h1>
        <Link to="/comprar" className={cn(buttonClass('ghost', 'sm'), '-mr-3')}>
          Seguir comprando
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-start lg:gap-8">
        <Card className="min-w-0 px-4 sm:px-6 lg:col-span-2">
          <CartItemList />
        </Card>
        {hasItems && (
          <Card className="p-6 lg:sticky lg:top-20">
            <CartSummary variant="page" />
          </Card>
        )}
      </div>
    </section>
  )
}
