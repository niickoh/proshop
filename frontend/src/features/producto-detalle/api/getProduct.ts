import { NotFoundError } from '../../../lib/errors'
import { apiGet, isMockMode, simulateLatency } from '../../../lib/http'
import { PRODUCTS } from '../../catalogo/data/products'
import type { Product } from '../../catalogo/types'

export const SIMULATED_LATENCY_MS = 300

/**
 * `GET /api/products/:id`; lanza `NotFoundError` (404) si no existe.
 * Con `VITE_USE_MOCKS=false` llama al backend; si no, busca en el array local.
 */
export async function getProduct(id: string, signal?: AbortSignal): Promise<Product> {
  if (!isMockMode()) return apiGet<Product>(`/products/${encodeURIComponent(id)}`, { signal })
  await simulateLatency(SIMULATED_LATENCY_MS, signal)
  const product = PRODUCTS.find((p) => p.id === id)
  if (!product) throw new NotFoundError(`Producto ${id} no encontrado`, 'PRODUCT_NOT_FOUND')
  return product
}
