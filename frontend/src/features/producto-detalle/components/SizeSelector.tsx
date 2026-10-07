import { useId } from 'react'
import { CircleAlert } from 'lucide-react'
import Chip from '../../../shared/ui/Chip'

type Props = {
  sizes: string[]
  selected?: string
  onSelect: (size: string) => void
  /** Muestra "Selecciona una talla" con este id (lo referencian los botones de compra). */
  errorId: string
  showError: boolean
}

export default function SizeSelector({ sizes, selected, onSelect, errorId, showError }: Props) {
  const labelId = useId()

  return (
    <div role="group" aria-labelledby={labelId} className="space-y-3">
      <p id={labelId} className="text-sm font-semibold text-slate-900">
        Talla{selected && <span className="font-normal text-slate-500">: {selected}</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = size === selected
          return (
            <Chip
              key={size}
              selected={isSelected}
              aria-label={`Talla ${size}`}
              onClick={() => onSelect(size)}
              className={showError && !isSelected ? 'ring-red-600' : undefined}
            >
              {size}
            </Chip>
          )
        })}
      </div>
      {showError && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert aria-hidden="true" size={16} strokeWidth={1.75} className="shrink-0" />
          Selecciona una talla
        </p>
      )}
    </div>
  )
}
