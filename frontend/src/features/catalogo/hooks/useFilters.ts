import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { filtersToParams, paramsToFilters } from '../filtersParams'
import type { ProductFilters } from '../types'

/** Filtros aplicados: viven en la URL (compartir, recargar y botón Atrás). */
export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams])

  const applyFilters = useCallback(
    (next: ProductFilters) => {
      setSearchParams(filtersToParams(next))
      window.scrollTo({ top: 0 })
    },
    [setSearchParams],
  )

  const clearFilters = useCallback(
    () => applyFilters({ sort: filters.sort }),
    [applyFilters, filters.sort],
  )

  return { filters, applyFilters, clearFilters }
}
