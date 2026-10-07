import type { FiltersChange, ProductFilters } from '../types'
import CheckboxList from './CheckboxList'
import FilterGroup from './FilterGroup'

type Props = { filters: ProductFilters; onChange: FiltersChange }

const options = [
  { value: 'inStockOnly', label: 'Solo con stock' },
  { value: 'onSale', label: 'En oferta' },
]

export default function AvailabilityFilter({ filters, onChange }: Props) {
  const selected = options
    .map((o) => o.value)
    .filter((key) => filters[key as 'inStockOnly' | 'onSale'])

  return (
    <FilterGroup title="Disponibilidad" selectedCount={selected.length}>
      <CheckboxList
        options={options}
        selected={selected}
        onChange={(next) =>
          onChange({
            inStockOnly: next.includes('inStockOnly') || undefined,
            onSale: next.includes('onSale') || undefined,
          })
        }
      />
    </FilterGroup>
  )
}
