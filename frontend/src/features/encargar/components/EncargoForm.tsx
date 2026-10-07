import { CircleAlert } from 'lucide-react'
import Button from '../../../shared/ui/Button'
import Input from '../../../shared/ui/Input'
import Select from '../../../shared/ui/Select'
import type { EncargoFormState } from '../hooks/useEncargoForm'
import { TALLAS } from '../schema'
import FormField from './FormField'
import QuantityInput from './QuantityInput'

type Props = Pick<
  EncargoFormState,
  'form' | 'onSubmit' | 'cantidad' | 'stepCantidad' | 'isSending' | 'hasSendError'
>

export default function EncargoForm({
  form,
  onSubmit,
  cantidad,
  stepCantidad,
  isSending,
  hasSendError,
}: Props) {
  const { register, formState } = form
  const { errors } = formState

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <p className="text-xs font-medium text-slate-500">* Campos obligatorios</p>

      {hasSendError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          <CircleAlert aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0" />
          No pudimos enviar tu encargo. Revisa tu conexión e inténtalo de nuevo
        </div>
      )}

      <fieldset disabled={isSending} className="min-w-0">
        <legend className="sr-only">Datos del encargo</legend>
        <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
          <FormField label="Nombre" required error={errors.nombre?.message}>
            {(control) => (
              <Input
                {...control}
                {...register('nombre')}
                type="text"
                autoComplete="given-name"
                invalid={!!errors.nombre}
                className="min-h-11"
              />
            )}
          </FormField>

          <FormField label="Apellido" required error={errors.apellido?.message}>
            {(control) => (
              <Input
                {...control}
                {...register('apellido')}
                type="text"
                autoComplete="family-name"
                invalid={!!errors.apellido}
                className="min-h-11"
              />
            )}
          </FormField>

          <FormField label="Correo" required error={errors.correo?.message}>
            {(control) => (
              <Input
                {...control}
                {...register('correo')}
                type="email"
                autoComplete="email"
                invalid={!!errors.correo}
                className="min-h-11"
              />
            )}
          </FormField>

          <FormField label="Teléfono" required error={errors.telefono?.message}>
            {(control) => (
              <Input
                {...control}
                {...register('telefono')}
                type="tel"
                autoComplete="tel"
                placeholder="+56 9 1234 5678"
                invalid={!!errors.telefono}
                className="min-h-11"
              />
            )}
          </FormField>

          <FormField
            label="Dirección"
            required
            error={errors.direccion?.message}
            className="md:col-span-2"
          >
            {(control) => (
              <Input
                {...control}
                {...register('direccion')}
                type="text"
                autoComplete="street-address"
                invalid={!!errors.direccion}
                className="min-h-11"
              />
            )}
          </FormField>

          <FormField
            label="Producto"
            required
            help="Nombre, marca o enlace del producto"
            error={errors.producto?.message}
            className="md:col-span-2"
          >
            {(control) => (
              <Input
                {...control}
                {...register('producto')}
                type="text"
                invalid={!!errors.producto}
                className="min-h-11"
              />
            )}
          </FormField>

          <FormField label="Talla" error={errors.talla?.message}>
            {(control) => (
              <Select
                {...control}
                {...register('talla')}
                invalid={!!errors.talla}
                className="min-h-11"
              >
                <option value="">No aplica</option>
                {TALLAS.map((talla) => (
                  <option key={talla} value={talla}>
                    {talla}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField label="Cantidad" required error={errors.cantidad?.message}>
            {(control) => (
              <QuantityInput
                control={control}
                registration={register('cantidad', { valueAsNumber: true })}
                value={cantidad}
                invalid={!!errors.cantidad}
                onStep={stepCantidad}
              />
            )}
          </FormField>

          {/* Honeypot anti-spam: invisible para personas, los bots suelen llenarlo. */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor="encargo-website">Sitio web</label>
            <input
              id="encargo-website"
              {...register('website')}
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" size="lg" fullWidth loading={isSending}>
              {isSending ? 'Enviando…' : 'Enviar encargo'}
            </Button>
          </div>
        </div>
      </fieldset>
    </form>
  )
}
