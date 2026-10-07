import { apiGet, isMockMode, simulateLatency } from '../../../lib/http'
import { PRODUCTS } from '../data/products'
import { filtersToApiParams } from '../filtersParams'
import type { ProductFilters, ProductsPage } from '../types'
import { queryProducts } from './queryProducts'

export const SIMULATED_LATENCY_MS = 300

export type GetProductsParams = {
  filters: ProductFilters
  page: number
  /** 0 devuelve solo el total (usado por el contador del drawer). */
  limit: number
  signal?: AbortSignal
}

/**
 * `GET /api/products?<filtros>&page&limit`. Con `VITE_USE_MOCKS=false` llama al backend;
 * si no, simula la respuesta sobre el array local.
 */
export async function getProducts({
  filters,
  page,
  limit,
  signal,
}: GetProductsParams): Promise<ProductsPage> {
  if (!isMockMode()) {
    const params = filtersToApiParams(filters)
    params.set('page', String(page))
    params.set('limit', String(limit))
    return apiGet<ProductsPage>('/products', { params, signal })
  }
  await simulateLatency(SIMULATED_LATENCY_MS, signal)
  return queryProducts(PRODUCTS, filters, page, limit)
}
