import ConfirmDialog from '../ConfirmDialog'

type Props = { onLeave: () => void; onStay: () => void }

/** Aviso al intentar salir del formulario con cambios sin guardar. */
export default function UnsavedChangesDialog({ onLeave, onStay }: Props) {
  return (
    <ConfirmDialog
      title="Tienes cambios sin guardar"
      description="Si sales ahora, se perderán los cambios que hiciste en este producto."
      confirmLabel="Salir sin guardar"
      cancelLabel="Seguir editando"
      onConfirm={onLeave}
      onCancel={onStay}
    />
  )
}
