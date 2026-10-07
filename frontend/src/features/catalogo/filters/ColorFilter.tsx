import { clsx } from 'clsx'
import { COLORS } from '../data/filterOptions'
import type { FiltersChange, ProductFilters } from '../types'
import FilterGroup from './FilterGroup'

type Props = { filters: ProductFilters; onChange: FiltersChange }

export default function ColorFilter({ filters, onChange }: Props) {
  const selected = filters.color ?? []
  const toggle = (color: string) =>
    onChange({
      color: selected.includes(color) ? selected.filter((c) => c !== color) : [...selected, color],
    })

  return (
    <FilterGroup title="Color" selectedCount={selected.length}>
      <div className="flex flex-wrap gap-1">
        {COLORS.map(({ name, swatch }) => {
          const isSelected = selected.includes(name)
          return (
            <button
              key={name}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Color ${name}`}
              title={name}
              onClick={() => toggle(name)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className={clsx(
                  'size-8 rounded-full border border-gray-300',
                  swatch,
                  isSelected && 'ring-2 ring-gray-900 ring-offset-2',
                )}
              />
            </button>
          )
        })}
      </div>
    </FilterGroup>
  )
}
