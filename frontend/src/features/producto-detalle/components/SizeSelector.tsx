import { useId } from 'react'
import { clsx } from 'clsx'

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
    <div role="group" aria-labelledby={labelId} className="space-y-2">
      <p id={labelId} className="text-sm font-semibold text-gray-900">
        Talla{selected && <span className="font-normal text-gray-600">: {selected}</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = size === selected
          return (
            <button
              key={size}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Talla ${size}`}
              onClick={() => onSelect(size)}
              className={clsx(
                'min-h-11 min-w-11 rounded-md border px-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none',
                isSelected
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : showError
                    ? 'border-red-600 text-gray-700 hover:border-red-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-500',
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
      {showError && (
        <p id={errorId} role="alert" className="text-sm font-medium text-red-700">
          Selecciona una talla
        </p>
      )}
    </div>
  )
}
