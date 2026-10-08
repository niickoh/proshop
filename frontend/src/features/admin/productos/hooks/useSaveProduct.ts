import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAdminProduct, updateAdminProduct } from '../api/adminProductsApi'
import { invalidateProductQueries } from '../invalidateProductQueries'
import type { ProductInput } from '../schema'

/** Sin `id` crea; con `id` reemplaza enviando la `version` que se editó. */
export type SaveProductVariables = { values: ProductInput } & (
  { id?: undefined } | { id: string; version: number }
)

export function useSaveProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: SaveProductVariables) =>
      variables.id === undefined
        ? createAdminProduct(variables.values)
        : updateAdminProduct(variables.id, { ...variables.values, version: variables.version }),
    // No se espera la invalidación: la vuelta al listado no depende de ella.
    onSuccess: (product) => {
      void invalidateProductQueries(queryClient, product.id)
    },
  })
}
