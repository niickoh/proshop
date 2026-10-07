import { Minus, Plus } from 'lucide-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import IconButton from '../../../shared/ui/IconButton'
import Input from '../../../shared/ui/Input'
import { CANTIDAD_MAX, CANTIDAD_MIN } from '../schema'
import type { FieldControlProps } from './FormField'

type Props = {
  control: FieldControlProps
  registration: UseFormRegisterReturn<'cantidad'>
  value: number
  invalid: boolean
  onStep: (delta: 1 | -1) => void
}

/** Cantidad con − / +: los botones respetan el rango 1 a 20. */
export default function QuantityInput({ control, registration, value, invalid, onStep }: Props) {
  const current = Number.isNaN(value) ? CANTIDAD_MIN : value

  return (
    <div className="flex items-center gap-2">
      <IconButton
        variant="secondary"
        aria-label="Disminuir cantidad"
        disabled={current <= CANTIDAD_MIN}
        onClick={() => onStep(-1)}
      >
        <Minus aria-hidden="true" size={20} strokeWidth={1.75} />
      </IconButton>
      <Input
        {...control}
        {...registration}
        type="number"
        inputMode="numeric"
        min={CANTIDAD_MIN}
        max={CANTIDAD_MAX}
        step={1}
        invalid={invalid}
        className="min-h-11 w-20 px-2 text-center tabular-nums"
      />
      <IconButton
        variant="secondary"
        aria-label="Aumentar cantidad"
        disabled={current >= CANTIDAD_MAX}
        onClick={() => onStep(1)}
      >
        <Plus aria-hidden="true" size={20} strokeWidth={1.75} />
      </IconButton>
    </div>
  )
}
