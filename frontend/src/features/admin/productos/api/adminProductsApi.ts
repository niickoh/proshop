// Siempre llama al backend: el panel de admin no usa VITE_USE_MOCKS ni `data/`.
import { apiGet, apiSend } from '../../../../lib/http'
import type { ProductInput, ProductUpdateInput } from '../schema'
import type { AdminProduct, AdminProductsFilters, AdminProductsPage } from '../types'

export const ADMIN_PAGE_SIZE = 20

/** `GET /api/admin/products` con búsqueda, filtros, orden y paginación. */
export function getAdminProducts(
  filters: AdminProductsFilters,
  signal?: AbortSignal,
): Promise<AdminProductsPage> {
  const params = new URLSearchParams({
    status: filters.status,
    sort: filters.sort,
    page: String(filters.page),
    limit: String(ADMIN_PAGE_SIZE),
  })
  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  return apiGet<AdminProductsPage>('/admin/products', { params, signal })
}

const productPath = (id: string) => `/admin/products/${encodeURIComponent(id)}`

/** `GET /api/admin/products/:id`, incluidos los archivados. */
export function getAdminProduct(id: string, signal?: AbortSignal): Promise<AdminProduct> {
  return apiGet<AdminProduct>(productPath(id), { signal })
}

/** `POST /api/admin/products` → 201. */
export function createAdminProduct(body: ProductInput): Promise<AdminProduct> {
  return apiSend<AdminProduct>('post', '/admin/products', body)
}

/** `PUT /api/admin/products/:id`. Con una `version` desactualizada responde 409 VERSION_CONFLICT. */
export function updateAdminProduct(id: string, body: ProductUpdateInput): Promise<AdminProduct> {
  return apiSend<AdminProduct>('put', productPath(id), body)
}

/** `PATCH /api/admin/products/:id/status`: archiva (`false`) o reactiva (`true`). */
export function setAdminProductStatus(id: string, active: boolean): Promise<AdminProduct> {
  return apiSend<AdminProduct>('patch', `${productPath(id)}/status`, { active })
}
