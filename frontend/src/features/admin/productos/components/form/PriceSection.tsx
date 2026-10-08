import { useFormContext, useWatch } from 'react-hook-form'
import FormField from '../../../../encargar/components/FormField'
import { getDiscountPercent } from '../../../../../shared/utils/formatPrice'
import { parsePrice, type ProductFormValues } from '../../productFormValues'
import FormSection from './FormSection'
import PriceInput from './PriceInput'

export default function PriceSection() {
  const { register, control, formState } = useFormContext<ProductFormValues>()
  const { errors } = formState
  const [price, compareAtPrice] = useWatch({ control, name: ['price', 'compareAtPrice'] })
  const discount =
    Number.isFinite(price) && Number.isFinite(compareAtPrice)
      ? getDiscountPercent(price, compareAtPrice)
      : 0

  return (
    <FormSection title="Precio" description="En pesos chilenos, sin decimales.">
      <div className="grid gap-x-6 gap-y-5 @lg:grid-cols-2">
        <FormField label="Precio" required error={errors.price?.message}>
          {(field) => (
            <PriceInput
              {...field}
              {...register('price', { setValueAs: parsePrice })}
              invalid={!!errors.price}
            />
          )}
        </FormField>

        <FormField
          label="Precio anterior"
          help="Opcional. Si es mayor que el precio, el producto se muestra en oferta."
          error={errors.compareAtPrice?.message}
        >
          {(field) => (
            <PriceInput
              {...field}
              {...register('compareAtPrice', { setValueAs: parsePrice })}
              invalid={!!errors.compareAtPrice}
            />
          )}
        </FormField>
      </div>
      <p aria-live="polite" className="text-sm font-medium text-slate-700">
        {discount > 0 ? `Descuento: ${discount}%` : 'Sin descuento'}
      </p>
    </FormSection>
  )
}
