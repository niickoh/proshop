import { useId } from 'react'
import { useFocusTrap } from '../../../catalogo/hooks/useFocusTrap'
import Button from '../../../../shared/ui/Button'

type Props = {
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  /** También con Escape o al tocar fuera. */
  onCancel: () => void
}

/**
 * Diálogo de confirmación propio (no `confirm()`): atrapa el foco, cierra con Escape
 * y devuelve el foco al salir. El foco empieza en la opción segura (cancelar).
 */
export default function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Props) {
  const containerRef = useFocusTrap<HTMLDivElement>(true, onCancel)
  const titleId = useId()
  const descriptionId = useId()

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center p-4 sm:items-center">
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <div
        ref={containerRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold break-words text-slate-900">
          {title}
        </h2>
        <p id={descriptionId} className="text-sm text-slate-600">
          {description}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
