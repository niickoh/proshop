import Chip from '../../../shared/ui/Chip'
import { cn } from '../../../shared/ui/cn'
import { colorSwatch } from '../data/filterOptions'
import { useProductFilters } from '../hooks/useProductFilters'
import type { FiltersChange, ProductFilters } from '../types'
import FilterGroup from './FilterGroup'

type Props = { filters: ProductFilters; onChange: FiltersChange }

export default function ColorFilter({ filters, onChange }: Props) {
  const colors = useProductFilters().data?.colors ?? []
  const selected = filters.color ?? []
  const toggle = (color: string) =>
    onChange({
      color: selected.includes(color) ? selected.filter((c) => c !== color) : [...selected, color],
    })

  return (
    <FilterGroup title="Color" selectedCount={selected.length}>
      <div className="flex flex-wrap gap-2">
        {colors.map((name) => (
          <Chip
            key={name}
            selected={selected.includes(name)}
            aria-label={`Color ${name}`}
            title={name}
            onClick={() => toggle(name)}
            // Píldora redonda: el nombre va en aria-label/title; solo se ve la muestra.
            className="size-11 px-0 md:size-11 md:min-h-11"
          >
            <span
              aria-hidden="true"
              className={cn('size-7 rounded-full ring-1 ring-slate-900/10', colorSwatch(name))}
            />
          </Chip>
        ))}
      </div>
    </FilterGroup>
  )
}
