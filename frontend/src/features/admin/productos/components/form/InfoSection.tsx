import { useFormContext, useWatch } from 'react-hook-form'
import FormField from '../../../../encargar/components/FormField'
import { cn } from '../../../../../shared/ui/cn'
import Input from '../../../../../shared/ui/Input'
import Select from '../../../../../shared/ui/Select'
import { fieldClass } from '../../../../../shared/ui/styles'
import type { ProductFormValues } from '../../productFormValues'
import { PRODUCT_CATEGORIES } from '../../schema'
import FormSection from './FormSection'

const DESCRIPTION_MAX = 2000

const GENDER_LABELS = { mujer: 'Mujer', hombre: 'Hombre', unisex: 'Unisex' } as const

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export default function InfoSection() {
  const { register, control, formState } = useFormContext<ProductFormValues>()
  const { errors } = formState
  const description = useWatch({ control, name: 'description' }) ?? ''

  return (
    <FormSection title="Información">
      <div className="grid gap-x-6 gap-y-5 @lg:grid-cols-2">
        <FormField label="Nombre" required error={errors.name?.message}>
          {(field) => <Input {...field} {...register('name')} invalid={!!errors.name} />}
        </FormField>

        <FormField label="Marca" required error={errors.brand?.message}>
          {(field) => <Input {...field} {...register('brand')} invalid={!!errors.brand} />}
        </FormField>

        <FormField label="Categoría" required error={errors.category?.message}>
          {(field) => (
            <Select {...field} {...register('category')} invalid={!!errors.category}>
              <option value="">Elige una categoría</option>
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {capitalize(category)}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Género" required error={errors.gender?.message}>
          {(field) => (
            <Select {...field} {...register('gender')} invalid={!!errors.gender}>
              <option value="">Elige un género</option>
              {Object.entries(GENDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField
          label="Descripción"
          required
          help={`${description.length} / ${DESCRIPTION_MAX} caracteres`}
          error={errors.description?.message}
          className="@lg:col-span-2"
        >
          {(field) => (
            <textarea
              {...field}
              {...register('description')}
              rows={5}
              className={cn(fieldClass(!!errors.description), 'h-auto min-h-32 py-3')}
            />
          )}
        </FormField>
      </div>
    </FormSection>
  )
}
