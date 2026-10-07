import type { UseFormRegisterReturn } from 'react-hook-form'
import { CANTIDAD_MAX, CANTIDAD_MIN } from '../schema'
import { controlClass } from './controlClass'
import type { FieldControlProps } from './FormField'

type Props = {
  control: FieldControlProps
  registration: UseFormRegisterReturn<'cantidad'>
  value: number
  invalid: boolean
  onStep: (delta: 1 | -1) => void
}

const stepButton =
  'flex min-h-11 min-w-11 items-center justify-center rounded-md border border-gray-300 text-lg text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

/** Cantidad con − / +: los botones respetan el rango 1 a 20. */
export default function QuantityInput({ control, registration, value, invalid, onStep }: Props) {
  const current = Number.isNaN(value) ? CANTIDAD_MIN : value

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Disminuir cantidad"
        disabled={current <= CANTIDAD_MIN}
        onClick={() => onStep(-1)}
        className={stepButton}
      >
        <span aria-hidden="true">−</span>
      </button>
      <input
        {...control}
        {...registration}
        type="number"
        inputMode="numeric"
        min={CANTIDAD_MIN}
        max={CANTIDAD_MAX}
        step={1}
        className={controlClass(invalid, 'w-20 text-center')}
      />
      <button
        type="button"
        aria-label="Aumentar cantidad"
        disabled={current >= CANTIDAD_MAX}
        onClick={() => onStep(1)}
        className={stepButton}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  )
}
