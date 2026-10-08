import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { PRODUCT_CATEGORIES } from '../schema'
import {
  ADMIN_PRODUCT_SORTS,
  ADMIN_PRODUCT_STATUSES,
  type AdminProductSort,
  type AdminProductsFilters,
  type AdminProductStatus,
} from '../types'

const DEFAULTS = { status: 'active', sort: 'nuevos', page: 1 } as const

const oneOf = <T extends string>(options: readonly T[], value: string | null): T | undefined =>
  options.includes(value as T) ? (value as T) : undefined

export function paramsToAdminFilters(params: URLSearchParams): AdminProductsFilters {
  const page = Number(params.get('page'))
  const q = params.get('q')?.trim()
  const category = oneOf(PRODUCT_CATEGORIES, params.get('category'))
  return {
    ...(q && { q }),
    ...(category && { category }),
    status:
      oneOf<AdminProductStatus>(ADMIN_PRODUCT_STATUSES, params.get('status')) ?? DEFAULTS.status,
    sort: oneOf<AdminProductSort>(ADMIN_PRODUCT_SORTS, params.get('sort')) ?? DEFAULTS.sort,
    page: Number.isInteger(page) && page > 1 ? page : DEFAULTS.page,
  }
}

/** Solo los valores distintos del valor por defecto, para URLs cortas. */
function adminFiltersToParams(filters: AdminProductsFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.status !== DEFAULTS.status) params.set('status', filters.status)
  if (filters.sort !== DEFAULTS.sort) params.set('sort', filters.sort)
  if (filters.page !== DEFAULTS.page) params.set('page', String(filters.page))
  return params
}

/** Filtros del listado de admin: viven en la URL (compartir, recargar y botón Atrás). */
export function useAdminProductsFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => paramsToAdminFilters(searchParams), [searchParams])

  /** Cambiar un filtro vuelve a la página 1, salvo que el cambio sea la página. */
  const updateFilters = useCallback(
    (patch: Partial<AdminProductsFilters>) => {
      const next = { ...filters, page: DEFAULTS.page, ...patch }
      // Escribir en la búsqueda no llena el historial
      setSearchParams(adminFiltersToParams(next), { replace: 'q' in patch })
    },
    [filters, setSearchParams],
  )

  /** Mantiene el orden; quita búsqueda, categoría y vuelve a "Activos". */
  const clearFilters = useCallback(
    () => setSearchParams(adminFiltersToParams({ ...DEFAULTS, sort: filters.sort })),
    [filters.sort, setSearchParams],
  )

  // Distingue "no hay productos" de "no hay resultados con estos filtros"
  const isFiltered = Boolean(filters.q || filters.category || filters.status !== DEFAULTS.status)

  return { filters, updateFilters, clearFilters, isFiltered }
}
