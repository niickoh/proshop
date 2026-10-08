import type { QueryClient } from '@tanstack/react-query'
import { ADMIN_PRODUCTS_KEY } from './useAdminProducts'

/**
 * Tras guardar, archivar o reactivar: el panel y las queries públicas del catálogo
 * (`/comprar`, sus filtros y el detalle) se vuelven a pedir sin recargar la página.
 */
export function invalidateProductQueries(queryClient: QueryClient, id: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEY }),
    queryClient.invalidateQueries({ queryKey: ['products'] }),
    queryClient.invalidateQueries({ queryKey: ['products-count'] }),
    queryClient.invalidateQueries({ queryKey: ['product-filters'] }),
    queryClient.invalidateQueries({ queryKey: ['product', id] }),
  ])
}
