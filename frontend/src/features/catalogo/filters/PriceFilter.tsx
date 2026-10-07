import { useId } from 'react'
import { isPriceRangeValid } from '../filtersParams'
import type { FiltersChange, ProductFilters } from '../types'
import FilterGroup from './FilterGroup'

type Props = { filters: ProductFilters; onChange: FiltersChange }

const toPrice = (value: string) =>
  value === '' ? undefined : Math.max(0, Math.round(Number(value)))

const inputClass =
  'min-h-11 w-full min-w-0 rounded-md border border-gray-300 px-3 text-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none aria-invalid:border-red-600'

export default function PriceFilter({ filters, onChange }: Props) {
  const errorId = useId()
  const invalid = !isPriceRangeValid(filters)
  const active = filters.priceMin !== undefined || filters.priceMax !== undefined

  return (
    <FilterGroup title="Precio" selectedCount={active ? 1 : 0}>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-gray-600">
          Mínimo
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            aria-label="Precio mínimo"
            aria-invalid={invalid}
            aria-describedby={invalid ? errorId : undefined}
            value={filters.priceMin ?? ''}
            onChange={(event) => onChange({ priceMin: toPrice(event.target.value) })}
            className={inputClass}
          />
        </label>
        <label className="text-xs text-gray-600">
          Máximo
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            aria-label="Precio máximo"
            aria-invalid={invalid}
            aria-describedby={invalid ? errorId : undefined}
            value={filters.priceMax ?? ''}
            onChange={(event) => onChange({ priceMax: toPrice(event.target.value) })}
            className={inputClass}
          />
        </label>
      </div>
      {invalid && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-700">
          El precio mínimo no puede ser mayor que el máximo.
        </p>
      )}
    </FilterGroup>
  )
}
