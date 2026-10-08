import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import { useMediaQuery } from '../../../../shared/hooks/useMediaQuery'
import Button from '../../../../shared/ui/Button'
import { buttonClass } from '../../../../shared/ui/styles'
import ArchiveDialog from '../components/ArchiveDialog'
import ProductsCardList from '../components/ProductsCardList'
import ProductsMessage from '../components/ProductsMessage'
import ProductsPagination from '../components/ProductsPagination'
import ProductsSkeleton from '../components/ProductsSkeleton'
import ProductsTable from '../components/ProductsTable'
import ProductsToolbar from '../components/ProductsToolbar'
import { useAdminProducts } from '../hooks/useAdminProducts'
import { useAdminProductsFilters } from '../hooks/useAdminProductsFilters'
import { useSetProductStatus } from '../hooks/useSetProductStatus'

const NEW_PRODUCT_PATH = '/admin/productos/nuevo'

const countLabel = (total: number) => `${total} ${total === 1 ? 'producto' : 'productos'}`

export default function AdminProductsPage() {
  const { filters, updateFilters, isFiltered, clearFilters } = useAdminProductsFilters()
  const { data, isPending, isError, refetch, isFetching } = useAdminProducts(filters)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { toggleStatus, toArchive, confirmArchive, cancelArchive } = useSetProductStatus()

  const changePage = (page: number) => {
    updateFilters({ page })
    window.scrollTo({ top: 0 })
  }

  return (
    <section aria-labelledby="admin-products-title" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="admin-products-title" className="text-2xl font-bold text-slate-900">
            Productos
          </h1>
          {data && (
            <p className="text-sm text-slate-600" aria-live="polite">
              {countLabel(data.total)}
            </p>
          )}
        </div>
        <Link to={NEW_PRODUCT_PATH} className={buttonClass('primary')}>
          <Plus aria-hidden="true" size={20} strokeWidth={1.75} />
          Nuevo producto
        </Link>
      </div>

      <ProductsToolbar filters={filters} onChange={updateFilters} />

      {isPending ? (
        <ProductsSkeleton />
      ) : isError && !data ? (
        <ProductsMessage
          role="alert"
          title="No pudimos cargar los productos"
          description="Revisa tu conexión e inténtalo de nuevo."
        >
          <Button variant="secondary" loading={isFetching} onClick={() => refetch()}>
            Reintentar
          </Button>
        </ProductsMessage>
      ) : data.total === 0 && !isFiltered ? (
        <ProductsMessage
          title="Aún no hay productos"
          description="Crea tu primer producto para que aparezca en la tienda."
        >
          <Link to={NEW_PRODUCT_PATH} className={buttonClass('primary')}>
            Crear el primero
          </Link>
        </ProductsMessage>
      ) : data.total === 0 ? (
        <ProductsMessage
          role="status"
          title="No encontramos productos"
          description="Prueba con otra búsqueda o cambia los filtros."
        >
          <Button variant="secondary" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </ProductsMessage>
      ) : (
        <>
          {isDesktop ? (
            <ProductsTable products={data.items} onToggleStatus={toggleStatus} />
          ) : (
            <ProductsCardList products={data.items} onToggleStatus={toggleStatus} />
          )}
          <ProductsPagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={changePage}
          />
        </>
      )}

      {toArchive && (
        <ArchiveDialog name={toArchive.name} onConfirm={confirmArchive} onCancel={cancelArchive} />
      )}
    </section>
  )
}
