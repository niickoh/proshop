import { CATEGORY_LABELS } from '../data/filterOptions'
import { CATEGORIES, type FiltersChange, type ProductFilters } from '../types'
import CheckboxList from './CheckboxList'
import FilterGroup from './FilterGroup'

type Props = { filters: ProductFilters; onChange: FiltersChange }

const options = CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] }))

export default function CategoryFilter({ filters, onChange }: Props) {
  return (
    <FilterGroup title="Categoría" selectedCount={filters.category?.length}>
      <CheckboxList
        options={options}
        selected={filters.category}
        onChange={(category) => onChange({ category })}
      />
    </FilterGroup>
  )
}
