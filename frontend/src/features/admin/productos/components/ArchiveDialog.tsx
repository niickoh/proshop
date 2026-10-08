import ConfirmDialog from './ConfirmDialog'

type Props = { name: string; onConfirm: () => void; onCancel: () => void }

export default function ArchiveDialog({ name, onConfirm, onCancel }: Props) {
  return (
    <ConfirmDialog
      title={`¿Archivar «${name}»?`}
      description="Dejará de verse en la tienda, pero podrás reactivarlo."
      confirmLabel="Archivar"
      cancelLabel="Cancelar"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
