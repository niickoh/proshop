import { useController, useFormContext } from 'react-hook-form'
import type { ProductFormValues } from '../../productFormValues'
import FormSection from './FormSection'
import SwitchField from './SwitchField'

export default function AvailabilitySection() {
  const { control } = useFormContext<ProductFormValues>()
  const { field: inStock } = useController({ control, name: 'inStock' })
  const { field: active } = useController({ control, name: 'active' })

  return (
    <FormSection title="Disponibilidad">
      <SwitchField
        label="En stock"
        description="Si lo desactivas, se muestra como agotado."
        checked={inStock.value}
        onChange={inStock.onChange}
      />
      <SwitchField
        label="Visible en la tienda"
        description="Si lo desactivas, el producto queda archivado."
        checked={active.value}
        onChange={active.onChange}
      />
    </FormSection>
  )
}
