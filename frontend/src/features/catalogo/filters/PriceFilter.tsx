import { useId } from 'react'
import { CircleAlert } from 'lucide-react'
import Input from '../../../shared/ui/Input'
import { isPriceRangeValid } from '../filtersParams'
import type { FiltersChange, ProductFilters } from '../types'
import FilterGroup from './FilterGroup'

type Props = { filters: ProductFilters; onChange: FiltersChange }

const toPrice = (value: string) =>
  value === '' ? undefined : Math.max(0, Math.round(Number(value)))

const labelClass = 'space-y-1 text-xs font-medium text-slate-500'

export default function PriceFilter({ filters, onChange }: Props) {
  const errorId = useId()
  const invalid = !isPriceRangeValid(filters)
  const active = filters.priceMin !== undefined || filters.priceMax !== undefined

  return (
    <FilterGroup title="Precio" selectedCount={active ? 1 : 0}>
      <div className="grid grid-cols-2 gap-2">
        <label className={labelClass}>
          <span className="block">Mínimo</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            aria-label="Precio mínimo"
            invalid={invalid}
            aria-describedby={invalid ? errorId : undefined}
            value={filters.priceMin ?? ''}
            onChange={(event) => onChange({ priceMin: toPrice(event.target.value) })}
            className="min-w-0 px-3 tabular-nums"
          />
        </label>
        <label className={labelClass}>
          <span className="block">Máximo</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            aria-label="Precio máximo"
            invalid={invalid}
            aria-describedby={invalid ? errorId : undefined}
            value={filters.priceMax ?? ''}
            onChange={(event) => onChange({ priceMax: toPrice(event.target.value) })}
            className="min-w-0 px-3 tabular-nums"
          />
        </label>
      </div>
      {invalid && (
        <p id={errorId} role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-red-600">
          <CircleAlert
            aria-hidden="true"
            size={16}
            strokeWidth={1.75}
            className="mt-0.5 shrink-0"
          />
          El precio mínimo no puede ser mayor que el máximo.
        </p>
      )}
    </FilterGroup>
  )
}
