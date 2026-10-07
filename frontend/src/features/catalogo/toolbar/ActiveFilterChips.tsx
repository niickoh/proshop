import { CATEGORY_LABELS, GENDER_LABELS } from '../data/filterOptions'
import { formatPrice } from '../../../shared/utils/formatPrice'
import type { Category, Gender, ListFilterKey, ProductFilters } from '../types'

type Props = {
  filters: ProductFilters
  onChange: (filters: ProductFilters) => void
  onClearAll: () => void
}

type Chip = { key: string; label: string; remove: (f: ProductFilters) => ProductFilters }

const listLabel: Record<ListFilterKey, (value: string) => string> = {
  category: (v) => CATEGORY_LABELS[v as Category] ?? v,
  gender: (v) => GENDER_LABELS[v as Gender] ?? v,
  size: (v) => `Talla ${v}`,
  color: (v) => `Color ${v}`,
  brand: (v) => v,
}

function priceLabel({ priceMin, priceMax }: ProductFilters) {
  if (priceMin !== undefined && priceMax !== undefined)
    return `Precio: ${formatPrice(priceMin)} – ${formatPrice(priceMax)}`
  if (priceMin !== undefined) return `Desde ${formatPrice(priceMin)}`
  return `Hasta ${formatPrice(priceMax ?? 0)}`
}

function buildChips(filters: ProductFilters): Chip[] {
  const chips: Chip[] = []
  for (const key of Object.keys(listLabel) as ListFilterKey[]) {
    for (const value of filters[key] ?? []) {
      chips.push({
        key: `${key}:${value}`,
        label: listLabel[key](value),
        remove: (f) => ({ ...f, [key]: f[key]?.filter((v) => v !== value) }),
      })
    }
  }
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    chips.push({
      key: 'price',
      label: priceLabel(filters),
      remove: (f) => ({ ...f, priceMin: undefined, priceMax: undefined }),
    })
  }
  if (filters.inStockOnly) {
    chips.push({
      key: 'inStockOnly',
      label: 'Solo con stock',
      remove: (f) => ({ ...f, inStockOnly: undefined }),
    })
  }
  if (filters.onSale) {
    chips.push({ key: 'onSale', label: 'En oferta', remove: (f) => ({ ...f, onSale: undefined }) })
  }
  return chips
}

export default function ActiveFilterChips({ filters, onChange, onClearAll }: Props) {
  const chips = buildChips(filters)
  if (chips.length === 0) return null

  return (
    <div className="flex min-w-0 items-center gap-2">
      <ul
        aria-label="Filtros activos"
        className="flex min-w-0 snap-x [scrollbar-width:none] gap-2 overflow-x-auto py-1 [&::-webkit-scrollbar]:hidden"
      >
        {chips.map((chip) => (
          <li key={chip.key} className="shrink-0 snap-start">
            <button
              type="button"
              aria-label={`Quitar filtro: ${chip.label}`}
              onClick={() => onChange(chip.remove(filters))}
              className="flex min-h-11 items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-3 text-sm whitespace-nowrap text-gray-800 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              {chip.label}
              <span aria-hidden="true">×</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClearAll}
        className="min-h-11 shrink-0 rounded-md px-2 text-sm font-medium text-blue-700 underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
      >
        Limpiar todo
      </button>
    </div>
  )
}
