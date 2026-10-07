import { Link } from 'react-router'
import { formatPrice } from '../../../shared/utils/formatPrice'
import { useCartStore } from '../store/cartStore'
import type { CartItem } from '../types'
import QuantityStepper from './QuantityStepper'

type Props = {
  item: CartItem
  onRemove: () => void
}

export default function CartItemRow({ item, onRemove }: Props) {
  const { productId, size, name, brand, image, price, compareAtPrice, quantity } = item
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const closeDrawer = useCartStore((s) => s.closeDrawer)
  const lineLabel = `${name}, talla ${size}`
  const onSale = compareAtPrice !== undefined && compareAtPrice > price

  return (
    <li className="flex gap-3 py-4">
      <Link
        to={`/comprar/${productId}`}
        onClick={closeDrawer}
        className="shrink-0 self-start rounded-md focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="aspect-[3/4] w-20 max-w-full rounded-md bg-gray-100 object-cover sm:w-24"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <p className="text-xs tracking-wide break-words text-gray-500 uppercase">{brand}</p>
            <p className="text-sm font-medium break-words text-gray-900">{name}</p>
            <p className="text-sm text-gray-600">Talla: {size}</p>
          </div>
          <button
            type="button"
            aria-label={`Eliminar ${lineLabel}`}
            onClick={onRemove}
            className="-mt-2 -mr-2 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </svg>
          </button>
        </div>

        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className={onSale ? 'text-red-700' : 'text-gray-700'}>
            {formatPrice(price)} c/u
          </span>
          {onSale && (
            <s className="text-xs text-gray-500">
              <span className="sr-only">Precio anterior: </span>
              {formatPrice(compareAtPrice)}
            </s>
          )}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            quantity={quantity}
            label={lineLabel}
            onChange={(next) => updateQuantity(productId, size, next)}
          />
          <p className="text-sm font-semibold text-gray-900">
            <span className="sr-only">Subtotal: </span>
            <span>{formatPrice(price * quantity)}</span>
          </p>
        </div>
      </div>
    </li>
  )
}
