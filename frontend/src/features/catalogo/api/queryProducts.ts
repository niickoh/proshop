// Filtrado, orden y paginación sobre un array. Simula lo que hará el backend
// y documenta la semántica esperada: OR dentro de cada grupo, AND entre grupos.
import type { Product, ProductFilters, ProductsPage } from '../types'

const matchesAny = (selected: string[] | undefined, values: string[]) =>
  !selected?.length || selected.some((value) => values.includes(value))

export function queryProducts(
  products: Product[],
  filters: ProductFilters,
  page: number,
  limit: number,
): ProductsPage {
  const filtered = products.filter(
    (p) =>
      matchesAny(filters.category, [p.category]) &&
      matchesAny(filters.gender, [p.gender]) &&
      matchesAny(filters.size, p.sizes) &&
      matchesAny(filters.color, p.colors) &&
      matchesAny(filters.brand, [p.brand]) &&
      (filters.priceMin === undefined || p.price >= filters.priceMin) &&
      (filters.priceMax === undefined || p.price <= filters.priceMax) &&
      (!filters.inStockOnly || p.inStock) &&
      (!filters.onSale || (p.compareAtPrice !== undefined && p.compareAtPrice > p.price)),
  )

  const sorted = [...filtered]
  switch (filters.sort) {
    case 'precio-asc':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'precio-desc':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'nuevos':
      sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      break
  }

  const start = (page - 1) * limit
  return {
    items: sorted.slice(start, start + limit),
    total: sorted.length,
    page,
    hasMore: limit > 0 && start + limit < sorted.length,
  }
}
