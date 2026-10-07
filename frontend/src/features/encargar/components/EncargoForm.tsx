import type { EncargoFormState } from '../hooks/useEncargoForm'
import { TALLAS } from '../schema'
import { controlClass } from './controlClass'
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
      <p className="text-sm text-gray-600">* Campos obligatorios</p>

      {hasSendError && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos enviar tu encargo. Revisa tu conexión e inténtalo de nuevo
        </div>
      )}

      <fieldset disabled={isSending} className="min-w-0">
        <legend className="sr-only">Datos del encargo</legend>
        <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
          <FormField label="Nombre" required error={errors.nombre?.message}>
            {(control) => (
              <input
                {...control}
                {...register('nombre')}
                type="text"
                autoComplete="given-name"
                className={controlClass(!!errors.nombre)}
              />
            )}
          </FormField>

          <FormField label="Apellido" required error={errors.apellido?.message}>
            {(control) => (
              <input
                {...control}
                {...register('apellido')}
                type="text"
                autoComplete="family-name"
                className={controlClass(!!errors.apellido)}
              />
            )}
          </FormField>

          <FormField label="Correo" required error={errors.correo?.message}>
            {(control) => (
              <input
                {...control}
                {...register('correo')}
                type="email"
                autoComplete="email"
                className={controlClass(!!errors.correo)}
              />
            )}
          </FormField>

          <FormField label="Teléfono" required error={errors.telefono?.message}>
            {(control) => (
              <input
                {...control}
                {...register('telefono')}
                type="tel"
                autoComplete="tel"
                placeholder="+56 9 1234 5678"
                className={controlClass(!!errors.telefono)}
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
              <input
                {...control}
                {...register('direccion')}
                type="text"
                autoComplete="street-address"
                className={controlClass(!!errors.direccion)}
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
              <input
                {...control}
                {...register('producto')}
                type="text"
                className={controlClass(!!errors.producto)}
              />
            )}
          </FormField>

          <FormField label="Talla" error={errors.talla?.message}>
            {(control) => (
              <select {...control} {...register('talla')} className={controlClass(!!errors.talla)}>
                <option value="">No aplica</option>
                {TALLAS.map((talla) => (
                  <option key={talla} value={talla}>
                    {talla}
                  </option>
                ))}
              </select>
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
            <button
              type="submit"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-6 text-base font-semibold text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSending && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5 motion-safe:animate-spin"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeOpacity={0.3}
                    strokeWidth={3}
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {isSending ? 'Enviando…' : 'Enviar encargo'}
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  )
}
