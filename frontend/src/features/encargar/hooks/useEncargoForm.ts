import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '../../../lib/errors'
import { CANTIDAD_MAX, CANTIDAD_MIN, encargoSchema, type EncargoRequest } from '../schema'
import { useCreateEncargo } from './useCreateEncargo'

// El honeypot `website` solo existe en el formulario; no es parte del contrato.
const encargoFormSchema = encargoSchema.extend({ website: z.string() })
export type EncargoFormValues = z.input<typeof encargoFormSchema>
type EncargoFormOutput = z.output<typeof encargoFormSchema>

const DEFAULT_VALUES: EncargoFormValues = {
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  direccion: '',
  producto: '',
  talla: '',
  cantidad: 1,
  website: '',
}

const isEncargoField = (name: string): name is keyof EncargoRequest => name in encargoSchema.shape

/** Errores 422 del servidor con campos, en el orden del formulario. */
const serverFieldErrors = (error: unknown) =>
  error instanceof ApiError && error.status === 422 && error.fields
    ? Object.entries(error.fields).filter((entry): entry is [keyof EncargoRequest, string] =>
        isEncargoField(entry[0]),
      )
    : []

export function useEncargoForm() {
  const form = useForm<EncargoFormValues, unknown, EncargoFormOutput>({
    resolver: zodResolver(encargoFormSchema),
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  })
  const mutation = useCreateEncargo()
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID())
  const cantidad = useWatch({ control: form.control, name: 'cantidad' })

  const onSubmit = form.handleSubmit(({ website, ...body }) => {
    // Honeypot lleno: probablemente un bot, no se envía.
    if (website || mutation.isPending) return
    mutation.mutate(
      { body, idempotencyKey },
      {
        onError: (error) => {
          for (const [name, message] of serverFieldErrors(error)) {
            form.setError(name, { type: 'server', message })
          }
        },
      },
    )
  })

  // El foco se mueve tras el render, cuando los campos ya no están deshabilitados.
  const { setFocus } = form
  useEffect(() => {
    const [first] = serverFieldErrors(mutation.error)
    if (first) setFocus(first[0])
  }, [mutation.error, setFocus])

  const stepCantidad = (delta: 1 | -1) => {
    const current = Number.isNaN(cantidad) ? CANTIDAD_MIN : cantidad
    const next = Math.min(CANTIDAD_MAX, Math.max(CANTIDAD_MIN, Math.trunc(current) + delta))
    form.setValue('cantidad', next, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
  }

  /** "Hacer otro encargo": formulario vacío y una nueva Idempotency-Key. */
  const startOver = () => {
    form.reset(DEFAULT_VALUES)
    mutation.reset()
    setIdempotencyKey(crypto.randomUUID())
  }

  return {
    form,
    onSubmit,
    cantidad,
    stepCantidad,
    isSending: mutation.isPending,
    // 500 o error de red: aviso general (los 422 con campos se muestran en cada campo).
    hasSendError: mutation.isError && serverFieldErrors(mutation.error).length === 0,
    result: mutation.data,
    submittedEmail: mutation.variables?.body.correo,
    startOver,
  }
}

export type EncargoFormState = ReturnType<typeof useEncargoForm>
