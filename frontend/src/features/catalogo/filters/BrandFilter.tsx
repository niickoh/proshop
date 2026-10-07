import { useState } from 'react'
import Input from '../../../shared/ui/Input'
import { useProductFilters } from '../hooks/useProductFilters'
import type { FiltersChange, ProductFilters } from '../types'
import CheckboxList from './CheckboxList'
import FilterGroup from './FilterGroup'

type Props = { filters: ProductFilters; onChange: FiltersChange }

const SEARCH_THRESHOLD = 8

export default function BrandFilter({ filters, onChange }: Props) {
  const brands = useProductFilters().data?.brands ?? []
  const [search, setSearch] = useState('')
  const term = search.trim().toLocaleLowerCase('es')
  const visible = brands.filter((brand) => brand.toLocaleLowerCase('es').includes(term))

  return (
    <FilterGroup title="Marca" selectedCount={filters.brand?.length}>
      {brands.length > SEARCH_THRESHOLD && (
        <Input
          type="search"
          aria-label="Buscar marca"
          placeholder="Buscar marca"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mb-2"
        />
      )}
      <CheckboxList
        options={visible.map((brand) => ({ value: brand, label: brand }))}
        selected={filters.brand}
        onChange={(brand) => onChange({ brand })}
      />
      {visible.length === 0 && <p className="text-sm text-slate-500">Sin marcas.</p>}
    </FilterGroup>
  )
}
