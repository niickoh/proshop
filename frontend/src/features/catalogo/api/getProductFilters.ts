import { apiGet, isMockMode, simulateLatency } from '../../../lib/http'
import { PRODUCTS } from '../data/products'
import type { Product, ProductFilterOptions } from '../types'

export const SIMULATED_LATENCY_MS = 300

const LETTER_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

/** Letras (XS…XXL), luego números de calzado y al final el resto (ej. "U"). Igual que el backend. */
function sizeRank(size: string): [number, number] {
  const letter = LETTER_SIZES.indexOf(size)
  if (letter !== -1) return [0, letter]
  const n = Number(size)
  return size.trim() !== '' && Number.isFinite(n) ? [1, n] : [2, 0]
}

const compareSizes = (a: string, b: string) => {
  const [groupA, valueA] = sizeRank(a)
  const [groupB, valueB] = sizeRank(b)
  return groupA - groupB || valueA - valueB || a.localeCompare(b, 'es')
}

const distinct = (values: string[], compare = (a: string, b: string) => a.localeCompare(b, 'es')) =>
  [...new Set(values)].sort(compare)

/** Opciones de filtro calculadas desde los productos (misma regla que `GET /api/products/filters`). */
export function computeFilterOptions(products: Product[]): ProductFilterOptions {
  const prices = products.map((p) => p.price)
  return {
    categories: distinct(products.map((p) => p.category)),
    genders: distinct(products.map((p) => p.gender)),
    sizes: distinct(
      products.flatMap((p) => p.sizes),
      compareSizes,
    ),
    colors: distinct(products.flatMap((p) => p.colors)),
    brands: distinct(products.map((p) => p.brand)),
    priceRange: prices.length
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: 0, max: 0 },
  }
}

/** `GET /api/products/filters`. Con `VITE_USE_MOCKS=false` llama al backend; si no, calcula desde `data/`. */
export async function getProductFilters(signal?: AbortSignal): Promise<ProductFilterOptions> {
  if (!isMockMode()) return apiGet<ProductFilterOptions>('/products/filters', { signal })
  await simulateLatency(SIMULATED_LATENCY_MS, signal)
  return computeFilterOptions(PRODUCTS)
}
