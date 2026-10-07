import { useParams } from 'react-router'
import Button from '../../shared/ui/Button'
import BackToCatalog from './components/BackToCatalog'
import ProductDetailSkeleton from './components/ProductDetailSkeleton'
import ProductGallery from './components/ProductGallery'
import ProductInfo from './components/ProductInfo'
import PurchaseActions from './components/PurchaseActions'
import SizeSelector from './components/SizeSelector'
import { useDocumentTitle } from './hooks/useDocumentTitle'
import { useProduct } from './hooks/useProduct'
import { usePurchase } from './hooks/usePurchase'

export default function ProductoDetallePage() {
  const { id = '' } = useParams()
  const { data: product, isPending, isError, isNotFound, refetch } = useProduct(id)
  const { selectedSize, selectSize, showSizeError, sizeErrorId, addToCart, buyNow } =
    usePurchase(product)
  useDocumentTitle(product?.name)

  if (isPending) return <ProductDetailSkeleton />

  if (isNotFound) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 py-8 md:py-12">
        <p className="text-sm text-slate-600 md:text-base">
          Este producto no existe o ya no está disponible
        </p>
        <BackToCatalog />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 py-8 md:py-12">
        <BackToCatalog />
        <div role="alert" className="space-y-4">
          <p className="text-sm text-slate-600 md:text-base">
            No pudimos cargar el producto. Revisa tu conexión e inténtalo de nuevo.
          </p>
          <Button onClick={() => refetch()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <article key={product.id} className="mx-auto max-w-3xl space-y-8 pt-6 pb-28 md:pb-8">
      <BackToCatalog />
      <ProductGallery name={product.name} images={product.images} dimmed={!product.inStock} />
      <ProductInfo product={product}>
        <SizeSelector
          sizes={product.sizes}
          selected={selectedSize}
          onSelect={selectSize}
          errorId={sizeErrorId}
          showError={showSizeError}
        />
        <PurchaseActions
          disabled={!product.inStock}
          onAddToCart={addToCart}
          onBuyNow={buyNow}
          describedBy={showSizeError ? sizeErrorId : undefined}
        />
      </ProductInfo>
    </article>
  )
}
