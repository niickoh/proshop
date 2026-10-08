import { useState } from 'react'
import { useController, useFormContext, type FieldError } from 'react-hook-form'
import type { ProductFormValues } from '../productFormValues'
import { productFields } from '../schema'

type ListName = 'sizes' | 'colors' | 'images'

/** Error del arreglo completo o, si no hay, el del primer elemento inválido. */
const firstMessage = (error?: FieldError): string | undefined =>
  error?.message ??
  (Array.isArray(error)
    ? (error as (FieldError | undefined)[]).find((item) => item?.message)?.message
    : undefined)

/**
 * Campo de lista (tallas, colores, imágenes): agregar desde un borrador, quitar,
 * alternar y reordenar. Cada valor se valida con la regla del esquema antes de agregarlo.
 */
export function useListField(name: ListName) {
  const { control } = useFormContext<ProductFormValues>()
  const { field, fieldState } = useController({ control, name })
  const values = field.value ?? []
  const [draft, setDraft] = useState('')
  const [draftError, setDraftError] = useState<string>()

  // Valida al primer cambio (el campo queda "tocado").
  const update = (next: string[]) => {
    field.onChange(next)
    field.onBlur()
  }

  const has = (value: string) => values.some((v) => v.toLowerCase() === value.toLowerCase())

  /** Agrega el borrador. Devuelve false si no es válido (el error queda en `draftError`). */
  const addDraft = () => {
    const value = draft.trim()
    if (!value) return false
    const parsed = productFields.shape[name].element.safeParse(value)
    const error = parsed.success
      ? has(value)
        ? `Ya agregaste «${value}»`
        : undefined
      : parsed.error.issues[0]?.message
    setDraftError(error)
    if (error) return false
    update([...values, value])
    setDraft('')
    return true
  }

  const changeDraft = (value: string) => {
    setDraft(value)
    setDraftError(undefined)
  }

  const remove = (value: string) => update(values.filter((v) => v !== value))

  const toggle = (value: string) => (has(value) ? remove(value) : update([...values, value]))

  /** Mueve el elemento `index` una posición (`-1` sube, `1` baja). */
  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= values.length) return
    const next = [...values]
    const [item] = next.splice(index, 1)
    if (item !== undefined) next.splice(target, 0, item)
    update(next)
  }

  return {
    values,
    draft,
    changeDraft,
    addDraft,
    remove,
    toggle,
    move,
    /** Para enfocar el campo cuando la lista tiene un error. */
    ref: field.ref,
    error: draftError ?? firstMessage(fieldState.error),
  }
}
