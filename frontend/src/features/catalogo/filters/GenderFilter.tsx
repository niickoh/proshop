import { GENDER_LABELS } from '../data/filterOptions'
import { GENDERS, type FiltersChange, type ProductFilters } from '../types'
import CheckboxList from './CheckboxList'
import FilterGroup from './FilterGroup'

type Props = { filters: ProductFilters; onChange: FiltersChange }

const options = GENDERS.map((value) => ({ value, label: GENDER_LABELS[value] }))

export default function GenderFilter({ filters, onChange }: Props) {
  return (
    <FilterGroup title="Género" selectedCount={filters.gender?.length}>
      <CheckboxList
        options={options}
        selected={filters.gender}
        onChange={(gender) => onChange({ gender })}
      />
    </FilterGroup>
  )
}
