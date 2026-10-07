import { Link } from 'react-router'
import SaleBadge from '../../../shared/components/Badge/SaleBadge'
import SoldOutBadge from '../../../shared/components/Badge/SoldOutBadge'
import { cn } from '../../../shared/ui/cn'
import { focusRing, transition } from '../../../shared/ui/styles'
import { formatPrice, getDiscountPercent } from '../../../shared/utils/formatPrice'
import { FROM_CATALOG_STATE } from '../../../shared/utils/navigationState'
import type { Product } from '../types'

// Zoom suave al pasar el mouse, solo en escritorio y sin movimiento con prefers-reduced-motion.
const zoom = 'lg:group-hover:scale-105 motion-reduce:lg:group-hover:scale-100'

export default function ProductCard({ product }: { product: Product }) {
  const { id, name, brand, price, compareAtPrice, images, inStock } = product
  const discount = getDiscountPercent(price, compareAtPrice)
  const [cover, hover] = images

  return (
    <Link
      to={`/comprar/${id}`}
      state={FROM_CATALOG_STATE}
      className={cn('group block rounded-2xl', focusRing)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={cover}
          alt={name}
          loading="lazy"
          className={cn(
            'size-full object-cover',
            transition,
            zoom,
            !inStock && 'opacity-50 grayscale',
          )}
        />
        {hover && (
          <img
            src={hover}
            alt=""
            loading="lazy"
            className={cn(
              'absolute inset-0 size-full object-cover opacity-0 lg:group-hover:opacity-100',
              transition,
              zoom,
              !inStock && 'grayscale',
            )}
          />
        )}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
          {discount > 0 && <SaleBadge percent={discount} />}
          {!inStock && <SoldOutBadge />}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{brand}</p>
        <h3 className="line-clamp-2 text-sm font-medium break-words text-slate-900">{name}</h3>
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm tabular-nums">
          <span className={cn('font-semibold', discount > 0 ? 'text-red-600' : 'text-slate-900')}>
            {formatPrice(price)}
          </span>
          {discount > 0 && compareAtPrice !== undefined && (
            <s className="text-xs text-slate-500">
              <span className="sr-only">Precio anterior: </span>
              {formatPrice(compareAtPrice)}
            </s>
          )}
        </p>
      </div>
    </Link>
  )
}
