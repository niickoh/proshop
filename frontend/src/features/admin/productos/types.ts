// Contrato de `/api/admin/products` (ver Swagger: "Admin · Productos").
import type { ProductInput } from './schema'

export const ADMIN_PRODUCT_STATUSES = ['active', 'archived', 'all'] as const
export type AdminProductStatus = (typeof ADMIN_PRODUCT_STATUSES)[number]

export const ADMIN_PRODUCT_SORTS = ['nuevos', 'nombre', 'precio-asc', 'precio-desc'] as const
export type AdminProductSort = (typeof ADMIN_PRODUCT_SORTS)[number]

export type AdminProduct = ProductInput & {
  /** Generado desde el nombre; no editable */
  id: string
  /** Enviar en PUT; si no coincide con la guardada, la API responde 409 */
  version: number
  /** ISO 8601 */
  createdAt: string
  /** ISO 8601 */
  updatedAt: string
}

export type AdminProductsPage = {
  items: AdminProduct[]
  total: number
  page: number
  totalPages: number
}

/** Filtros del listado. Viven en la URL. */
export type AdminProductsFilters = {
  q?: string
  category?: string
  status: AdminProductStatus
  sort: AdminProductSort
  page: number
}
