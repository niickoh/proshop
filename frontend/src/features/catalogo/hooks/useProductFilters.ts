import { useQuery } from '@tanstack/react-query'
import { getProductFilters } from '../api/getProductFilters'

/** Opciones del panel de filtros (tallas, colores, marcas…) calculadas desde los productos. */
export function useProductFilters() {
  return useQuery({
    queryKey: ['product-filters'],
    queryFn: ({ signal }) => getProductFilters(signal),
    staleTime: 5 * 60_000,
  })
}
