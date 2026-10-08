import { useId } from 'react'
import { Search } from 'lucide-react'
import Input from '../../../../shared/ui/Input'
import Select from '../../../../shared/ui/Select'
import { useDebouncedSearch } from '../hooks/useDebouncedSearch'
import { PRODUCT_CATEGORIES } from '../schema'
import type { AdminProductSort, AdminProductsFilters, AdminProductStatus } from '../types'

const STATUS_LABELS: Record<AdminProductStatus, string> = {
  active: 'Activos',
  archived: 'Archivados',
  all: 'Todos',
}

const SORT_LABELS: Record<AdminProductSort, string> = {
  nuevos: 'Más nuevos',
  nombre: 'Nombre (A–Z)',
  'precio-asc': 'Precio: menor a mayor',
  'precio-desc': 'Precio: mayor a menor',
}

type Props = {
  filters: AdminProductsFilters
  onChange: (patch: Partial<AdminProductsFilters>) => void
}

const label = 'mb-1 block text-xs font-medium text-slate-600'

export default function ProductsToolbar({ filters, onChange }: Props) {
  const { draft, setDraft } = useDebouncedSearch(filters.q, (q) => onChange({ q }))
  const id = useId()

  return (
    <div
      role="search"
      aria-label="Filtrar productos"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]"
    >
      <div className="sm:col-span-2 xl:col-span-1">
        <label htmlFor={`${id}-q`} className={label}>
          Buscar
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            size={20}
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          />
          <Input
            id={`${id}-q`}
            type="search"
            placeholder="Nombre o marca"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-category`} className={label}>
          Categoría
        </label>
        <Select
          id={`${id}-category`}
          value={filters.category ?? ''}
          onChange={(event) => onChange({ category: event.target.value || undefined })}
          className="capitalize"
        >
          <option value="">Todas</option>
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor={`${id}-status`} className={label}>
          Estado
        </label>
        <Select
          id={`${id}-status`}
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value as AdminProductStatus })}
        >
          {Object.entries(STATUS_LABELS).map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor={`${id}-sort`} className={label}>
          Ordenar por
        </label>
        <Select
          id={`${id}-sort`}
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value as AdminProductSort })}
        >
          {Object.entries(SORT_LABELS).map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
