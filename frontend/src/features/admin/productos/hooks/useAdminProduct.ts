import { useQuery } from '@tanstack/react-query'
import { NotFoundError } from '../../../../lib/errors'
import { getAdminProduct } from '../api/adminProductsApi'
import { ADMIN_PRODUCTS_KEY } from './useAdminProducts'

export const adminProductKey = (id: string) => [...ADMIN_PRODUCTS_KEY, 'detail', id] as const

/** Producto a editar (incluidos los archivados). Sin `id` (crear) no pide nada. */
export function useAdminProduct(id?: string) {
  const query = useQuery({
    queryKey: adminProductKey(id ?? ''),
    queryFn: ({ signal }) => getAdminProduct(id ?? '', signal),
    enabled: id !== undefined,
    // Al editar se parte siempre de la última versión guardada.
    staleTime: 0,
  })
  return { ...query, isNotFound: query.error instanceof NotFoundError }
}
