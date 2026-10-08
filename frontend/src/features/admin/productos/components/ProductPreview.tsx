import { useFormContext, useWatch } from 'react-hook-form'
import ProductCard from '../../../catalogo/grid/ProductCard'
import type { Product } from '../../../catalogo/types'
import type { ProductFormValues } from '../productFormValues'

const PLACEHOLDER_DATE = new Date(0).toISOString()

/** Vista previa de la tarjeta del catálogo con los datos del formulario. */
export default function ProductPreview() {
  const { control } = useFormContext<ProductFormValues>()
  const values = useWatch({ control })
  const price = Number.isFinite(values.price) ? (values.price ?? 0) : 0
  const compareAtPrice = Number.isFinite(values.compareAtPrice) ? values.compareAtPrice : undefined
  const images = (values.images ?? []).filter((image): image is string => Boolean(image))

  const product: Product = {
    id: 'vista-previa',
    name: values.name?.trim() || 'Nombre del producto',
    brand: values.brand?.trim() || 'Marca',
    category: values.category ?? 'poleras',
    gender: values.gender ?? 'unisex',
    price,
    compareAtPrice,
    sizes: [],
    colors: [],
    images,
    inStock: values.inStock ?? true,
    description: '',
    createdAt: PLACEHOLDER_DATE,
  }

  return (
    <section aria-labelledby="vista-previa-titulo" className="space-y-3">
      <div>
        <h2 id="vista-previa-titulo" className="text-sm font-semibold text-slate-900">
          Vista previa
        </h2>
        <p className="text-xs text-slate-500">Así se verá en el catálogo.</p>
      </div>
      {images.length > 0 ? (
        // Solo se muestra: no se puede abrir ni enfocar.
        <div inert>
          <ProductCard product={product} />
        </div>
      ) : (
        <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
          Agrega una imagen para ver la vista previa
        </div>
      )}
    </section>
  )
}
