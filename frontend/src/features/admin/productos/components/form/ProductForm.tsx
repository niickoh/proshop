import { useId } from 'react'
import { Archive, ArchiveRestore, CircleAlert, RefreshCw } from 'lucide-react'
import { FormProvider } from 'react-hook-form'
import Button from '../../../../../shared/ui/Button'
import { useProductForm } from '../../hooks/useProductForm'
import type { AdminProduct } from '../../types'
import ArchiveDialog from '../ArchiveDialog'
import ProductPreview from '../ProductPreview'
import ProductStatusBadge from '../ProductStatusBadge'
import AvailabilitySection from './AvailabilitySection'
import ImagesSection from './ImagesSection'
import InfoSection from './InfoSection'
import PriceSection from './PriceSection'
import UnsavedChangesDialog from './UnsavedChangesDialog'
import VariantsSection from './VariantsSection'

const iconProps = { 'aria-hidden': true, size: 20, strokeWidth: 1.75 } as const

/** Crear (sin `product`) o editar un producto. */
export default function ProductForm({ product }: { product?: AdminProduct }) {
  const {
    form,
    onSubmit,
    saved,
    isSaving,
    isConflict,
    hasSaveError,
    reload,
    isReloading,
    cancel,
    blocker,
    status,
  } = useProductForm(product)
  const titleId = useId()
  const formId = useId()

  return (
    <FormProvider {...form}>
      <section aria-labelledby={titleId} className="space-y-6 pb-28">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h1 id={titleId} className="text-2xl font-bold text-slate-900">
              {saved ? 'Editar producto' : 'Nuevo producto'}
            </h1>
            {saved && (
              <p className="flex flex-wrap items-center gap-2 text-sm break-words text-slate-600">
                {saved.name}
                <ProductStatusBadge active={saved.active} />
              </p>
            )}
          </div>
          {saved && (
            <Button
              variant="secondary"
              onClick={() => status.toggleStatus(saved)}
              loading={status.isChanging}
            >
              {saved.active ? <Archive {...iconProps} /> : <ArchiveRestore {...iconProps} />}
              {saved.active ? 'Archivar' : 'Reactivar'}
            </Button>
          )}
        </div>

        {isConflict && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center"
          >
            <CircleAlert {...iconProps} className="shrink-0" />
            <p className="min-w-0 flex-1">
              Otra persona modificó este producto. Recarga para ver la última versión.
            </p>
            <Button variant="secondary" size="sm" loading={isReloading} onClick={reload}>
              <RefreshCw aria-hidden="true" size={16} strokeWidth={1.75} />
              Recargar
            </Button>
          </div>
        )}

        {hasSaveError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            <CircleAlert {...iconProps} className="shrink-0" />
            No pudimos guardar el producto. Revisa tu conexión e inténtalo de nuevo.
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-8">
          <form id={formId} noValidate onSubmit={onSubmit} className="@container min-w-0">
            <p className="mb-4 text-xs font-medium text-slate-500">* Campos obligatorios</p>
            <fieldset disabled={isSaving} className="min-w-0 space-y-6">
              <legend className="sr-only">Datos del producto</legend>
              <InfoSection />
              <PriceSection />
              <VariantsSection />
              <ImagesSection />
              <AvailabilitySection />
            </fieldset>
          </form>

          {/* Desde lg: columna lateral con la tarjeta del catálogo. */}
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <ProductPreview />
          </aside>
        </div>

        {/* Barra inferior fija con las acciones del formulario. */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Button variant="secondary" onClick={cancel} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" form={formId} loading={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar producto'}
            </Button>
          </div>
        </div>

        {status.toArchive && (
          <ArchiveDialog
            name={status.toArchive.name}
            onConfirm={status.confirmArchive}
            onCancel={status.cancelArchive}
          />
        )}

        {blocker.state === 'blocked' && (
          <UnsavedChangesDialog onLeave={blocker.proceed} onStay={blocker.reset} />
        )}
      </section>
    </FormProvider>
  )
}
