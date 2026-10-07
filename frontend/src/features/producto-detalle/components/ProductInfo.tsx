import { useId, type ReactNode } from 'react'
import { clsx } from 'clsx'
import SaleBadge from '../../../shared/components/Badge/SaleBadge'
import SoldOutBadge from '../../../shared/components/Badge/SoldOutBadge'
import { formatPrice, getDiscountPercent } from '../../../shared/utils/formatPrice'
import type { Product } from '../../catalogo/types'

type Props = {
  product: Product
  /** Contenido entre el precio y la descripción (talla y botones de compra). */
  children?: ReactNode
}

export default function ProductInfo({ product, children }: Props) {
  const { brand, name, price, compareAtPrice, inStock, description } = product
  const discount = getDiscountPercent(price, compareAtPrice)
  const descriptionId = useId()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm tracking-wide text-gray-500 uppercase">{brand}</p>
        <h1 className="text-2xl font-bold break-words text-gray-900 md:text-3xl">{name}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className={clsx(
              'text-xl font-semibold',
              discount > 0 ? 'text-red-700' : 'text-gray-900',
            )}
          >
            {formatPrice(price)}
          </span>
          {discount > 0 && compareAtPrice !== undefined && (
            <>
              <s className="text-base text-gray-500">
                <span className="sr-only">Precio anterior: </span>
                {formatPrice(compareAtPrice)}
              </s>
              <SaleBadge percent={discount} />
            </>
          )}
          {!inStock && <SoldOutBadge />}
        </p>
      </div>

      {children}

      <section aria-labelledby={descriptionId} className="space-y-2">
        <h2 id={descriptionId} className="text-lg font-semibold text-gray-900">
          Descripción
        </h2>
        <p className="break-words whitespace-pre-line text-gray-700">{description}</p>
      </section>
    </div>
  )
}
