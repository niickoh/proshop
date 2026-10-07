import { Minus, Plus } from 'lucide-react'
import IconButton from '../../../shared/ui/IconButton'
import { MAX_QUANTITY } from '../types'

type Props = {
  quantity: number
  /** Identifica la línea en los nombres accesibles, ej. "Polera, talla M". */
  label: string
  onChange: (quantity: number) => void
}

/** Píldora − cantidad +. */
export default function QuantityStepper({ quantity, label, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-full bg-white ring-1 ring-slate-200">
      <IconButton
        size="sm"
        aria-label={`Disminuir cantidad de ${label}`}
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
      >
        <Minus aria-hidden="true" size={16} strokeWidth={1.75} />
      </IconButton>
      <span
        role="status"
        aria-live="polite"
        className="min-w-8 text-center text-sm font-semibold text-slate-900 tabular-nums"
      >
        <span className="sr-only">Cantidad: </span>
        {quantity}
      </span>
      <IconButton
        size="sm"
        aria-label={`Aumentar cantidad de ${label}`}
        disabled={quantity >= MAX_QUANTITY}
        onClick={() => onChange(quantity + 1)}
      >
        <Plus aria-hidden="true" size={16} strokeWidth={1.75} />
      </IconButton>
    </div>
  )
}
