import type { DefaultValues } from 'react-hook-form'
import type { z } from 'zod'
import { productFields, type productInputSchema } from './schema'
import type { AdminProduct } from './types'

export type ProductFormValues = z.input<typeof productInputSchema>
export type ProductFormOutput = z.output<typeof productInputSchema>

/** Campos en el orden del formulario (para enfocar el primer error). */
export const PRODUCT_FIELD_ORDER = Object.keys(productFields.shape) as (keyof ProductFormValues)[]

export const EMPTY_PRODUCT: DefaultValues<ProductFormValues> = {
  name: '',
  brand: '',
  description: '',
  sizes: [],
  colors: [],
  images: [],
  inStock: true,
  active: true,
}

/** Solo los campos editables (sin id, versión ni fechas). */
export const toFormValues = (product: AdminProduct): ProductFormValues => ({
  name: product.name,
  brand: product.brand,
  category: product.category,
  gender: product.gender,
  description: product.description,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  sizes: product.sizes,
  colors: product.colors,
  images: product.images,
  inStock: product.inStock,
  active: product.active,
})

/** "$12.990" o "12990" → 12990; vacío → undefined (precio anterior opcional). */
export function parsePrice(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  const text = String(value ?? '').replace(/[$.\s]/g, '')
  return text === '' ? undefined : Number(text)
}
