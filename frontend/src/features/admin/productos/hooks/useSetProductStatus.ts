import { useCallback, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAdminNotice } from '../../hooks/useAdminNotice'
import { setAdminProductStatus } from '../api/adminProductsApi'
import { invalidateProductQueries } from '../invalidateProductQueries'
import type { AdminProduct } from '../types'

type Options = {
  /** Se llama con el producto actualizado (también al deshacer). */
  onChanged?: (product: AdminProduct) => void
}

/**
 * Archivar (con diálogo de confirmación) o reactivar (directo).
 * Tras cada cambio muestra un aviso con "Deshacer" durante 5 segundos.
 */
export function useSetProductStatus({ onChanged }: Options = {}) {
  const queryClient = useQueryClient()
  const showNotice = useAdminNotice((state) => state.showNotice)
  const [toArchive, setToArchive] = useState<AdminProduct | null>(null)

  const mutation = useMutation({
    mutationFn: ({ product, active }: { product: AdminProduct; active: boolean }) =>
      setAdminProductStatus(product.id, active),
    onSuccess: (updated) => {
      onChanged?.(updated)
      void invalidateProductQueries(queryClient, updated.id)
    },
    onError: () => showNotice({ message: 'No pudimos cambiar el estado. Inténtalo de nuevo.' }),
  })
  const { mutate } = mutation

  const change = useCallback(
    (product: AdminProduct, active: boolean) =>
      mutate(
        { product, active },
        {
          onSuccess: (updated) =>
            showNotice({
              message: `«${updated.name}» ${active ? 'reactivado' : 'archivado'}`,
              action: {
                label: 'Deshacer',
                onClick: () =>
                  mutate(
                    { product: updated, active: !active },
                    { onSuccess: () => showNotice({ message: 'Cambio deshecho' }) },
                  ),
              },
            }),
        },
      ),
    [mutate, showNotice],
  )

  /** Botón Archivar/Reactivar: archivar pide confirmación primero. */
  const toggleStatus = useCallback(
    (product: AdminProduct) => (product.active ? setToArchive(product) : change(product, true)),
    [change],
  )

  const confirmArchive = () => {
    if (toArchive) change(toArchive, false)
    setToArchive(null)
  }

  return {
    toggleStatus,
    toArchive,
    confirmArchive,
    cancelArchive: () => setToArchive(null),
    isChanging: mutation.isPending,
  }
}
