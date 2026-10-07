import { PRODUCTS } from '../data/products'
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

const abortError = () => new DOMException('La petición fue cancelada', 'AbortError')

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(abortError())
      },
      { once: true },
    )
  })
}

/**
 * Simula `GET /api/products?<filtros>&page&limit` sobre el array local.
 * Para conectar el backend, reemplazar el cuerpo por:
 *   const params = filtersToParams(filters); params.set('page', …); params.set('limit', …)
 *   fetch(`${import.meta.env.VITE_API_URL}/products?${params}`, { signal }).then(r => r.json())
 */
export async function getProducts({
  filters,
  page,
  limit,
  signal,
}: GetProductsParams): Promise<ProductsPage> {
  await wait(SIMULATED_LATENCY_MS, signal)
  return queryProducts(PRODUCTS, filters, page, limit)
}
