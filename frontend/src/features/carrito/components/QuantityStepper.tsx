import { MAX_QUANTITY } from '../types'

type Props = {
  quantity: number
  /** Identifica la línea en los nombres accesibles, ej. "Polera, talla M". */
  label: string
  onChange: (quantity: number) => void
}

const stepButton =
  'flex min-h-11 min-w-11 items-center justify-center rounded-md text-lg text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

export default function QuantityStepper({ quantity, label, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-md border border-gray-300">
      <button
        type="button"
        aria-label={`Disminuir cantidad de ${label}`}
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
        className={stepButton}
      >
        <span aria-hidden="true">−</span>
      </button>
      <span
        role="status"
        aria-live="polite"
        className="min-w-8 text-center text-sm font-medium text-gray-900"
      >
        <span className="sr-only">Cantidad: </span>
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`Aumentar cantidad de ${label}`}
        disabled={quantity >= MAX_QUANTITY}
        onClick={() => onChange(quantity + 1)}
        className={stepButton}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  )
}
