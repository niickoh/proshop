import Chip from '../../../shared/ui/Chip'
import { useProductFilters } from '../hooks/useProductFilters'
import type { FiltersChange, ProductFilters } from '../types'
import FilterGroup from './FilterGroup'

type Props = { filters: ProductFilters; onChange: FiltersChange }

export default function SizeFilter({ filters, onChange }: Props) {
  const sizes = useProductFilters().data?.sizes ?? []
  const selected = filters.size ?? []
  const toggle = (size: string) =>
    onChange({
      size: selected.includes(size) ? selected.filter((s) => s !== size) : [...selected, size],
    })

  return (
    <FilterGroup title="Talla" selectedCount={selected.length}>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <Chip
            key={size}
            selected={selected.includes(size)}
            aria-label={`Talla ${size}`}
            onClick={() => toggle(size)}
            className="px-3"
          >
            {size}
          </Chip>
        ))}
      </div>
    </FilterGroup>
  )
}
