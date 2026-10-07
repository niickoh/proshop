import { useState } from 'react'
import { BRANDS } from '../data/filterOptions'
import type { FiltersChange, ProductFilters } from '../types'
import CheckboxList from './CheckboxList'
import FilterGroup from './FilterGroup'

type Props = { filters: ProductFilters; onChange: FiltersChange }

const SEARCH_THRESHOLD = 8

export default function BrandFilter({ filters, onChange }: Props) {
  const [search, setSearch] = useState('')
  const term = search.trim().toLocaleLowerCase('es')
  const visible = BRANDS.filter((brand) => brand.toLocaleLowerCase('es').includes(term))

  return (
    <FilterGroup title="Marca" selectedCount={filters.brand?.length}>
      {BRANDS.length > SEARCH_THRESHOLD && (
        <input
          type="search"
          aria-label="Buscar marca"
          placeholder="Buscar marca"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mb-2 min-h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        />
      )}
      <CheckboxList
        options={visible.map((brand) => ({ value: brand, label: brand }))}
        selected={filters.brand}
        onChange={(brand) => onChange({ brand })}
      />
      {visible.length === 0 && <p className="px-1 text-sm text-gray-500">Sin marcas.</p>}
    </FilterGroup>
  )
}
