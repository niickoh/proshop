import { formatPrice } from '../../../../shared/utils/formatPrice'

type Props = { price: number; compareAtPrice?: number }

/** Precio y, si hay oferta, el precio anterior tachado. */
export default function ProductPrice({ price, compareAtPrice }: Props) {
  return (
    <span className="flex flex-col tabular-nums">
      <span className="font-semibold text-slate-900">{formatPrice(price)}</span>
      {compareAtPrice !== undefined && (
        <s className="text-xs text-slate-500">
          <span className="sr-only">Precio anterior: </span>
          {formatPrice(compareAtPrice)}
        </s>
      )}
    </span>
  )
}
