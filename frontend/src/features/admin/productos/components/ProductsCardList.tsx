import Card from '../../../../shared/ui/Card'
import type { AdminProduct } from '../types'
import ProductActions, { type ProductActionsProps } from './ProductActions'
import ProductPrice from './ProductPrice'
import ProductStatusBadge from './ProductStatusBadge'
import ProductStock from './ProductStock'
import ProductThumb from './ProductThumb'

type Props = ProductActionsProps & { products: AdminProduct[] }

/** Móvil: la tabla pasa a tarjetas apiladas con la misma información. */
export default function ProductsCardList({ products, onToggleStatus }: Props) {
  return (
    <ul aria-label="Productos" className="space-y-3">
      {products.map((product) => (
        <li key={product.id}>
          <Card className="space-y-3 p-4 ring-1 ring-slate-200/70">
            <div className="flex gap-3">
              <ProductThumb src={product.images[0]} />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="min-w-0 font-medium break-words text-slate-900">{product.name}</h3>
                  <ProductStatusBadge active={product.active} />
                </div>
                <p className="text-xs text-slate-500">
                  {product.brand} · <span className="capitalize">{product.category}</span>
                </p>
                <div className="flex flex-wrap items-end justify-between gap-2 text-sm">
                  <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />
                  <ProductStock inStock={product.inStock} />
                </div>
              </div>
            </div>
            <ProductActions product={product} onToggleStatus={onToggleStatus} />
          </Card>
        </li>
      ))}
    </ul>
  )
}
