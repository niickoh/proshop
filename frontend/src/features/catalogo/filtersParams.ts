import { SORT_OPTIONS, type ListFilterKey, type ProductFilters, type SortOption } from './types'

const LIST_KEYS: ListFilterKey[] = ['category', 'gender', 'size', 'color', 'brand']

/** Filtros → query params estables (listas ordenadas). Sirve para la URL y para la API. */
export function filtersToParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  for (const key of LIST_KEYS) {
    for (const value of [...(filters[key] ?? [])].sort()) params.append(key, value)
  }
  if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin))
  if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax))
  if (filters.inStockOnly) params.set('inStockOnly', '1')
  if (filters.onSale) params.set('onSale', '1')
  if (filters.sort && filters.sort !== 'relevancia') params.set('sort', filters.sort)
  return params
}

/** Filtros → query params de `GET /api/products`: listas separadas por comas, sin params vacíos. */
export function filtersToApiParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  for (const key of LIST_KEYS) {
    const values = filters[key]?.filter(Boolean)
    if (values?.length) params.set(key, [...values].sort().join(','))
  }
  if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin))
  if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax))
  if (filters.inStockOnly) params.set('inStockOnly', 'true')
  if (filters.onSale) params.set('onSale', 'true')
  if (filters.sort && filters.sort !== 'relevancia') params.set('sort', filters.sort)
  return params
}

const toNumber = (value: string | null) => {
  if (value === null || value.trim() === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export function paramsToFilters(params: URLSearchParams): ProductFilters {
  const filters: ProductFilters = {}
  for (const key of LIST_KEYS) {
    const values = params.getAll(key).filter(Boolean)
    if (values.length) filters[key] = values
  }
  const priceMin = toNumber(params.get('priceMin'))
  const priceMax = toNumber(params.get('priceMax'))
  if (priceMin !== undefined) filters.priceMin = priceMin
  if (priceMax !== undefined) filters.priceMax = priceMax
  if (params.get('inStockOnly') === '1') filters.inStockOnly = true
  if (params.get('onSale') === '1') filters.onSale = true
  const sort = params.get('sort')
  if (SORT_OPTIONS.includes(sort as SortOption)) filters.sort = sort as SortOption
  return filters
}

/** Clave estable para comparar filtros y usar como queryKey. */
export const filtersKey = (filters: ProductFilters) => filtersToParams(filters).toString()

export const isPriceRangeValid = ({ priceMin, priceMax }: ProductFilters) =>
  priceMin === undefined || priceMax === undefined || priceMin <= priceMax

/** Cantidad de filtros activos (sin contar el orden). */
export function countActiveFilters(filters: ProductFilters): number {
  return (
    LIST_KEYS.reduce((sum, key) => sum + (filters[key]?.length ?? 0), 0) +
    (filters.priceMin !== undefined || filters.priceMax !== undefined ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSale ? 1 : 0)
  )
}
