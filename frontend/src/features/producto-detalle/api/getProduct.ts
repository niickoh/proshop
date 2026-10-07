import { NotFoundError } from '../../../lib/errors'
import { PRODUCTS } from '../../catalogo/data/products'
import type { Product } from '../../catalogo/types'

export const SIMULATED_LATENCY_MS = 300

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const abort = () => reject(new DOMException('La petición fue cancelada', 'AbortError'))
    if (signal?.aborted) return abort()
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        abort()
      },
      { once: true },
    )
  })

/**
 * Simula `GET /api/products/:id` sobre el array local; lanza `NotFoundError` (404) si no existe.
 * Para conectar el backend, reemplazar el cuerpo por un `fetch` que lance `NotFoundError`
 * cuando `response.status === 404`.
 */
export async function getProduct(id: string, signal?: AbortSignal): Promise<Product> {
  await wait(SIMULATED_LATENCY_MS, signal)
  const product = PRODUCTS.find((p) => p.id === id)
  if (!product) throw new NotFoundError(`Producto ${id} no encontrado`)
  return product
}
