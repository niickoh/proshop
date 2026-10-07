import { useCallback, useState } from 'react'
import { useMediaQuery } from '../../shared/hooks/useMediaQuery'
import FiltersPanel from './filters/FiltersPanel'
import { countActiveFilters, isPriceRangeValid } from './filtersParams'
import { gridClass } from './grid/gridClass'
import ProductCardSkeleton from './grid/ProductCardSkeleton'
import ProductGrid from './grid/ProductGrid'
import { useFilters } from './hooks/useFilters'
import { useFiltersDraft } from './hooks/useFiltersDraft'
import { useProducts, useProductsCount } from './hooks/useProducts'
import ActiveFilterChips from './toolbar/ActiveFilterChips'
import CategoryChips from './toolbar/CategoryChips'
import ResultsToolbar from './toolbar/ResultsToolbar'

const buttonClass =
  'min-h-11 rounded-md bg-gray-900 px-6 text-sm font-medium text-white hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none'

export default function CatalogoPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { filters, applyFilters, clearFilters } = useFilters()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { draft, debouncedDraft, isValid, change, reset, clear, commit } = useFiltersDraft({
    applied: filters,
    apply: applyFilters,
    autoApply: isDesktop,
  })
  const products = useProducts(filters)
  const draftCount = useProductsCount(
    debouncedDraft,
    drawerOpen && !isDesktop && isPriceRangeValid(debouncedDraft),
  )

  const openDrawer = () => {
    reset()
    setDrawerOpen(true)
  }
  const closeDrawer = useCallback(() => {
    reset()
    setDrawerOpen(false)
  }, [reset])
  const applyDrawer = () => {
    commit()
    setDrawerOpen(false)
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold lg:text-3xl">Comprar</h1>

      <div className="mt-4 lg:flex lg:gap-8">
        {isDesktop && <FiltersPanel mode="sidebar" filters={draft} onChange={change} />}

        <div className="min-w-0 flex-1 space-y-4">
          {!isDesktop && (
            <CategoryChips
              selected={filters.category}
              onChange={(category) => applyFilters({ ...filters, category })}
            />
          )}
          <ResultsToolbar
            total={products.total}
            sort={filters.sort}
            onSortChange={(sort) => applyFilters({ ...filters, sort })}
            onOpenFilters={isDesktop ? undefined : openDrawer}
            activeCount={countActiveFilters(filters)}
          />
          <ActiveFilterChips filters={filters} onChange={applyFilters} onClearAll={clearFilters} />

          {products.isPending ? (
            <ul aria-label="Cargando productos" aria-busy="true" className={gridClass}>
              {Array.from({ length: 8 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </ul>
          ) : products.isError && !products.data ? (
            <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-gray-700">
                No pudimos cargar los productos. Revisa tu conexión e inténtalo de nuevo.
              </p>
              <button type="button" onClick={() => products.refetch()} className={buttonClass}>
                Reintentar
              </button>
            </div>
          ) : products.total === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-gray-700">No encontramos productos con estos filtros</p>
              <button type="button" onClick={clearFilters} className={buttonClass}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <ProductGrid
              products={products.products}
              total={products.total ?? 0}
              isStale={products.isPlaceholderData}
              hasNextPage={products.hasNextPage}
              isFetchingNextPage={products.isFetchingNextPage}
              fetchNextPage={products.fetchNextPage}
            />
          )}
        </div>
      </div>

      {!isDesktop && (
        <FiltersPanel
          mode="drawer"
          open={drawerOpen}
          filters={draft}
          onChange={change}
          isValid={isValid}
          count={draftCount.data}
          onClose={closeDrawer}
          onClear={clear}
          onApply={applyDrawer}
        />
      )}
    </div>
  )
}
