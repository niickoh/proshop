import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getAdminProducts } from '../api/adminProductsApi'
import type { AdminProductsFilters } from '../types'

/** Prefijo de las queries de admin; al guardar o archivar se invalida junto con el catálogo. */
export const ADMIN_PRODUCTS_KEY = ['admin-products'] as const

export function useAdminProducts(filters: AdminProductsFilters) {
  return useQuery({
    queryKey: [...ADMIN_PRODUCTS_KEY, filters],
    queryFn: ({ signal }) => getAdminProducts(filters, signal),
    placeholderData: keepPreviousData,
  })
}
