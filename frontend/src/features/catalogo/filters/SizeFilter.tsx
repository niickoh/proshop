import { clsx } from 'clsx'
import { SIZES } from '../data/filterOptions'
import type { FiltersChange, ProductFilters } from '../types'
import FilterGroup from './FilterGroup'

type Props = { filters: ProductFilters; onChange: FiltersChange }

export default function SizeFilter({ filters, onChange }: Props) {
  const selected = filters.size ?? []
  const toggle = (size: string) =>
    onChange({
      size: selected.includes(size) ? selected.filter((s) => s !== size) : [...selected, size],
    })

  return (
    <FilterGroup title="Talla" selectedCount={selected.length}>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => {
          const isSelected = selected.includes(size)
          return (
            <button
              key={size}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Talla ${size}`}
              onClick={() => toggle(size)}
              className={clsx(
                'min-h-11 min-w-11 rounded-md border px-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none',
                isSelected
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-gray-500',
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </FilterGroup>
  )
}
