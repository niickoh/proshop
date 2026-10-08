import { Link, useParams } from 'react-router'
import Button from '../../../../shared/ui/Button'
import { buttonClass } from '../../../../shared/ui/styles'
import ProductForm from '../components/form/ProductForm'
import ProductsMessage from '../components/ProductsMessage'
import { useAdminProduct } from '../hooks/useAdminProduct'
import { PRODUCTS_PATH } from '../hooks/useProductForm'

/** `/admin/productos/nuevo` y `/admin/productos/:id/editar`. */
export default function ProductFormPage() {
  const { id } = useParams()
  const { data, isPending, isNotFound, isError, refetch, isFetching } = useAdminProduct(id)

  if (id === undefined) return <ProductForm key="nuevo" />

  if (isPending) {
    return (
      <p role="status" className="py-8 text-slate-600">
        Cargando producto…
      </p>
    )
  }

  if (isNotFound) {
    return (
      <ProductsMessage
        role="alert"
        title="No encontramos este producto"
        description="Puede que el enlace esté mal escrito."
      >
        <Link to={PRODUCTS_PATH} className={buttonClass('secondary')}>
          Volver a productos
        </Link>
      </ProductsMessage>
    )
  }

  if (isError) {
    return (
      <ProductsMessage
        role="alert"
        title="No pudimos cargar el producto"
        description="Revisa tu conexión e inténtalo de nuevo."
      >
        <Button variant="secondary" loading={isFetching} onClick={() => refetch()}>
          Reintentar
        </Button>
      </ProductsMessage>
    )
  }

  return <ProductForm key={data.id} product={data} />
}
