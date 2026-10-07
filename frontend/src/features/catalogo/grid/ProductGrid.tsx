import { useCallback } from 'react'
import Button from '../../../shared/ui/Button'
import { cn } from '../../../shared/ui/cn'
import { transition } from '../../../shared/ui/styles'
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
        className={cn(gridClass, transition, isStale && 'opacity-50')}
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
          <Button variant="secondary" onClick={loadMore} disabled={isFetchingNextPage}>
            Cargar más
          </Button>
        ) : (
          <p className="text-sm text-slate-500">Viste los {total} productos</p>
        )}
      </div>
    </>
  )
}
