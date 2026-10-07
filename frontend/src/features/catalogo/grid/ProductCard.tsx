import { clsx } from 'clsx'
import { Link } from 'react-router'
import SaleBadge from '../../../shared/components/Badge/SaleBadge'
import SoldOutBadge from '../../../shared/components/Badge/SoldOutBadge'
import { formatPrice, getDiscountPercent } from '../../../shared/utils/formatPrice'
import { FROM_CATALOG_STATE } from '../../../shared/utils/navigationState'
import type { Product } from '../types'

export default function ProductCard({ product }: { product: Product }) {
  const { id, name, brand, price, compareAtPrice, images, inStock } = product
  const discount = getDiscountPercent(price, compareAtPrice)
  const [cover, hover] = images

  return (
    <Link
      to={`/comprar/${id}`}
      state={FROM_CATALOG_STATE}
      className="group block rounded-md focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100">
        <img
          src={cover}
          alt={name}
          loading="lazy"
          className={clsx('size-full object-cover', !inStock && 'opacity-50 grayscale')}
        />
        {hover && (
          <img
            src={hover}
            alt=""
            loading="lazy"
            className={clsx(
              'absolute inset-0 size-full object-cover opacity-0 transition-opacity lg:group-hover:opacity-100',
              !inStock && 'grayscale',
            )}
          />
        )}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          {discount > 0 && <SaleBadge percent={discount} />}
          {!inStock && <SoldOutBadge />}
        </div>
      </div>

      <div className="mt-2 space-y-0.5">
        <p className="text-xs tracking-wide text-gray-500 uppercase">{brand}</p>
        <h3 className="text-sm font-medium break-words text-gray-900">{name}</h3>
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className={clsx('font-semibold', discount > 0 ? 'text-red-700' : 'text-gray-900')}>
            {formatPrice(price)}
          </span>
          {discount > 0 && compareAtPrice !== undefined && (
            <s className="text-xs text-gray-500">
              <span className="sr-only">Precio anterior: </span>
              {formatPrice(compareAtPrice)}
            </s>
          )}
        </p>
      </div>
    </Link>
  )
}
