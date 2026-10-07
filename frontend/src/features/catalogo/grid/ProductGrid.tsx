import { clsx } from 'clsx'
import { useCallback } from 'react'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import type { Product } from '../types'
import { gridClass } from './gridClass'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'

type Props = {
  products: Product[]
  total: number
  /** Resultados anteriores mientras cargan los nuevos filtros. */
  isStale: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export default function ProductGrid({
  products,
  total,
  isStale,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: Props) {
  const loadMore = useCallback(() => fetchNextPage(), [fetchNextPage])
  const sentinelRef = useInfiniteScroll<HTMLDivElement>(
    hasNextPage && !isFetchingNextPage && !isStale,
    loadMore,
  )

  return (
    <>
      <ul
        aria-label="Productos"
        aria-busy={isStale}
        className={clsx(gridClass, 'transition-opacity', isStale && 'opacity-50')}
      >
        {products.map((product) => (
          <li key={product.id} className="min-w-0">
            <ProductCard product={product} />
          </li>
        ))}
        {isFetchingNextPage &&
          Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={`next-${i}`} />)}
      </ul>

      <div ref={sentinelRef} aria-hidden="true" />

      <div className="flex justify-center py-8">
        {hasNextPage ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={isFetchingNextPage}
            className="min-h-11 rounded-md border border-gray-300 px-6 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
          >
            Cargar más
          </button>
        ) : (
          <p className="text-sm text-gray-500">Viste los {total} productos</p>
        )}
      </div>
    </>
  )
}
