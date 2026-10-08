import { cn } from '../../../../shared/ui/cn'
import type { AdminProduct } from '../types'
import ProductActions, { type ProductActionsProps } from './ProductActions'
import ProductPrice from './ProductPrice'
import ProductStatusBadge from './ProductStatusBadge'
import ProductStock from './ProductStock'
import ProductThumb from './ProductThumb'

type Props = ProductActionsProps & { products: AdminProduct[] }

const COLUMNS = ['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones']
const th = 'px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase'
const td = 'px-4 py-3 align-middle'

/** Desde md. Si no cabe, la tabla tiene su propio scroll horizontal (no la página). */
export default function ProductsTable({ products, onToggleStatus }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <table className="w-full min-w-[720px] text-sm">
        <caption className="sr-only">Productos</caption>
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className={th}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id}>
              <td className={td}>
                <div className="flex items-center gap-3">
                  <ProductThumb src={product.images[0]} />
                  <div className="min-w-0">
                    <p className="font-medium break-words text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.brand}</p>
                  </div>
                </div>
              </td>
              <td className={cn(td, 'text-slate-700 capitalize')}>{product.category}</td>
              <td className={td}>
                <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />
              </td>
              <td className={td}>
                <ProductStock inStock={product.inStock} />
              </td>
              <td className={td}>
                <ProductStatusBadge active={product.active} />
              </td>
              <td className={td}>
                <ProductActions product={product} onToggleStatus={onToggleStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
