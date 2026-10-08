import { z } from 'zod'

// =====================================================================================
// Copia del esquema compartido del backend.
// ⚠️ Debe mantenerse igual a backend/src/infrastructure/http/admin/products/adminProductSchemas.ts
//    (sección "Esquema compartido"): si cambias una regla aquí, cámbiala también allá.
// =====================================================================================

export const PRODUCT_CATEGORIES = [
  'poleras',
  'pantalones',
  'chaquetas',
  'vestidos',
  'calzado',
  'accesorios',
] as const

export const PRODUCT_GENDERS = ['mujer', 'hombre', 'unisex'] as const

export const MAX_PRICE = 10_000_000

/** Rutas `/products/...` o URLs `https://...` */
const IMAGE_PATTERN = /^(\/products\/|https:\/\/)\S+$/

const hasNoDuplicates = (values: string[]) =>
  new Set(values.map((value) => value.toLowerCase())).size === values.length

/** Entero CLP entre 1 y MAX_PRICE. `label` va con artículo: "El precio". */
const price = (label: string) =>
  z
    .number({ error: `${label} es obligatorio` })
    .int(`${label} debe ser un número entero`)
    .min(1, `${label} debe ser al menos $1`)
    .max(MAX_PRICE, `${label} no puede superar $10.000.000`)

export const productFields = z.object({
  name: z
    .string({ error: 'Ingresa el nombre' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(80, 'El nombre puede tener hasta 80 caracteres'),
  brand: z
    .string({ error: 'Ingresa la marca' })
    .trim()
    .min(2, 'La marca debe tener al menos 2 caracteres')
    .max(40, 'La marca puede tener hasta 40 caracteres'),
  category: z.enum(PRODUCT_CATEGORIES, { error: 'Elige una categoría' }),
  gender: z.enum(PRODUCT_GENDERS, { error: 'Elige mujer, hombre o unisex' }),
  description: z
    .string({ error: 'Ingresa la descripción' })
    .trim()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(2000, 'La descripción puede tener hasta 2000 caracteres'),
  price: price('El precio'),
  compareAtPrice: price('El precio anterior').optional(),
  sizes: z
    .array(
      z.string().trim().min(1, 'La talla no puede estar vacía').max(10, 'Talla demasiado larga'),
    )
    .min(1, 'Agrega al menos una talla')
    .max(15, 'Puede tener hasta 15 tallas')
    .refine(hasNoDuplicates, 'No repitas tallas'),
  colors: z
    .array(
      z
        .string()
        .trim()
        .min(2, 'Cada color debe tener al menos 2 caracteres')
        .max(20, 'Cada color puede tener hasta 20 caracteres'),
    )
    .min(1, 'Agrega al menos un color')
    .max(10, 'Puede tener hasta 10 colores')
    .refine(hasNoDuplicates, 'No repitas colores'),
  images: z
    .array(
      z.string().trim().regex(IMAGE_PATTERN, 'Usa una ruta /products/... o una URL https://...'),
    )
    .min(1, 'Agrega al menos una imagen')
    .max(8, 'Puede tener hasta 8 imágenes')
    .refine(hasNoDuplicates, 'No repitas imágenes'),
  inStock: z.boolean({ error: 'Indica si está en stock' }),
  active: z.boolean({ error: 'Indica si es visible en la tienda' }),
})

type ProductFields = z.infer<typeof productFields>

const compareAtPriceAbovePrice = (value: Pick<ProductFields, 'price' | 'compareAtPrice'>) =>
  value.compareAtPrice === undefined || value.compareAtPrice > value.price

const compareAtPriceRule = {
  path: ['compareAtPrice'],
  message: 'El precio anterior debe ser mayor que el precio',
}

/** Crear producto */
export const productInputSchema = productFields.refine(compareAtPriceAbovePrice, compareAtPriceRule)

/** Editar producto: incluye la versión que se editó */
export const productUpdateSchema = productFields
  .extend({ version: z.number({ error: 'Falta la versión' }).int().min(0) })
  .refine(compareAtPriceAbovePrice, compareAtPriceRule)

export type ProductInput = z.infer<typeof productInputSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
