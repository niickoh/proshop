import { Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '../../../shared/ui/cn'
import IconButton from '../../../shared/ui/IconButton'
import { focusRing } from '../../../shared/ui/styles'
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
    <li className="flex gap-4 py-5">
      <Link
        to={`/comprar/${productId}`}
        onClick={closeDrawer}
        className={cn('shrink-0 self-start rounded-xl', focusRing)}
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="aspect-[3/4] w-20 max-w-full rounded-xl bg-slate-100 object-cover sm:w-24"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium tracking-wide break-words text-slate-500 uppercase">
              {brand}
            </p>
            <p className="text-sm font-medium break-words text-slate-900">{name}</p>
            <p className="text-xs font-medium text-slate-500">Talla: {size}</p>
          </div>
          <IconButton
            aria-label={`Eliminar ${lineLabel}`}
            onClick={onRemove}
            className="-mt-2 -mr-2 shrink-0 text-slate-500"
          >
            <Trash2 aria-hidden="true" size={20} strokeWidth={1.75} />
          </IconButton>
        </div>

        <p className="flex flex-wrap items-baseline gap-x-2 text-sm tabular-nums">
          <span className={onSale ? 'text-red-600' : 'text-slate-600'}>
            {formatPrice(price)} c/u
          </span>
          {onSale && (
            <s className="text-xs text-slate-500">
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
          <p className="text-sm font-semibold text-slate-900 tabular-nums">
            <span className="sr-only">Subtotal: </span>
            <span>{formatPrice(price * quantity)}</span>
          </p>
        </div>
      </div>
    </li>
  )
}
