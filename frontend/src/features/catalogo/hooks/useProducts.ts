import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getProducts } from '../api/getProducts'
import { filtersKey } from '../filtersParams'
import type { ProductFilters } from '../types'

export const PAGE_SIZE = 24

export function useProducts(filters: ProductFilters) {
  const query = useInfiniteQuery({
    queryKey: ['products', filtersKey(filters)],
    queryFn: ({ pageParam, signal }) =>
      getProducts({ filters, page: pageParam, limit: PAGE_SIZE, signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  })

  const products = query.data?.pages.flatMap((page) => page.items) ?? []
  const total = query.data?.pages[0]?.total

  return { ...query, products, total }
}

/** Solo el total (limit = 0), para el botón "Ver N resultados" del drawer. */
export function useProductsCount(filters: ProductFilters, enabled: boolean) {
  return useQuery({
    queryKey: ['products-count', filtersKey(filters)],
    queryFn: ({ signal }) => getProducts({ filters, page: 1, limit: 0, signal }),
    select: (page) => page.total,
    placeholderData: keepPreviousData,
    enabled,
  })
}
