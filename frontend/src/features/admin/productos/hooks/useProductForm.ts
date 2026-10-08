import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useBlocker, useNavigate } from 'react-router'
import { ApiError } from '../../../../lib/errors'
import { useAdminNotice } from '../../hooks/useAdminNotice'
import { getAdminProduct } from '../api/adminProductsApi'
import {
  EMPTY_PRODUCT,
  PRODUCT_FIELD_ORDER,
  toFormValues,
  type ProductFormOutput,
  type ProductFormValues,
} from '../productFormValues'
import { productInputSchema } from '../schema'
import type { AdminProduct } from '../types'
import { adminProductKey } from './useAdminProduct'
import { useSaveProduct } from './useSaveProduct'
import { useSetProductStatus } from './useSetProductStatus'

export const PRODUCTS_PATH = '/admin/productos'

/** Errores 422 por campo, en el orden del formulario (`sizes.1` → `sizes`). */
const serverFieldErrors = (error: unknown) => {
  if (!(error instanceof ApiError) || error.status !== 422 || !error.fields) return []
  const entries = Object.entries(error.fields)
  return PRODUCT_FIELD_ORDER.flatMap((name) => {
    const match = entries.find(([key]) => key === name || key.startsWith(`${name}.`))
    return match ? [[name, match[1]] as const] : []
  })
}

const isVersionConflict = (error: unknown) => error instanceof ApiError && error.status === 409

/** Crear (sin `product`) o editar un producto. */
export function useProductForm(product?: AdminProduct) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const showNotice = useAdminNotice((state) => state.showNotice)
  const form = useForm<ProductFormValues, unknown, ProductFormOutput>({
    resolver: zodResolver(productInputSchema),
    mode: 'onTouched',
    defaultValues: product ? toFormValues(product) : EMPTY_PRODUCT,
  })
  // Última versión conocida en el servidor: cambia al archivar/reactivar o al recargar.
  const [saved, setSaved] = useState(product)
  const [isReloading, setIsReloading] = useState(false)
  const save = useSaveProduct()
  const { isDirty } = form.formState

  // Tras guardar se sale sin aviso.
  const leaving = useRef(false)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !leaving.current && currentLocation.pathname !== nextLocation.pathname,
  )

  // Recargar o cerrar la pestaña: el navegador muestra su propio aviso.
  useEffect(() => {
    if (!isDirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  const onSubmit = form.handleSubmit((values) => {
    if (save.isPending) return
    save.mutate(saved ? { id: saved.id, version: saved.version, values } : { values }, {
      onSuccess: () => {
        leaving.current = true
        showNotice({ message: 'Producto guardado' })
        void navigate(PRODUCTS_PATH)
      },
      onError: (error) => {
        for (const [name, message] of serverFieldErrors(error)) {
          form.setError(name, { type: 'server', message })
        }
      },
    })
  })

  // El foco se mueve tras el render, cuando los campos ya no están deshabilitados.
  const { setFocus } = form
  useEffect(() => {
    const [first] = serverFieldErrors(save.error)
    if (first) setFocus(first[0])
  }, [save.error, setFocus])

  /** 409: trae la última versión y reemplaza el formulario con ella. */
  const reload = async () => {
    if (!saved) return
    setIsReloading(true)
    try {
      const latest = await queryClient.fetchQuery({
        queryKey: adminProductKey(saved.id),
        queryFn: ({ signal }) => getAdminProduct(saved.id, signal),
        // Siempre al servidor: la copia en caché es justamente la desactualizada.
        staleTime: 0,
      })
      form.reset(toFormValues(latest))
      setSaved(latest)
      save.reset()
    } finally {
      setIsReloading(false)
    }
  }

  // Archivar o reactivar desde la edición: "Visible en la tienda" sigue al servidor.
  const status = useSetProductStatus({
    onChanged: (updated) => {
      form.resetField('active', { defaultValue: updated.active })
      setSaved(updated)
    },
  })

  return {
    form,
    onSubmit,
    saved,
    isSaving: save.isPending,
    isConflict: isVersionConflict(save.error),
    // 500 o error de red: aviso general (los 422 con campos se muestran en cada campo).
    hasSaveError:
      save.isError && !isVersionConflict(save.error) && serverFieldErrors(save.error).length === 0,
    reload,
    isReloading,
    cancel: () => void navigate(PRODUCTS_PATH),
    blocker,
    status,
  }
}

export type ProductFormState = ReturnType<typeof useProductForm>
