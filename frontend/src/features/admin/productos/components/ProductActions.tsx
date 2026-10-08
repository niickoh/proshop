import { Archive, ArchiveRestore, Pencil } from 'lucide-react'
import { Link } from 'react-router'
import Button from '../../../../shared/ui/Button'
import { buttonClass } from '../../../../shared/ui/styles'
import type { AdminProduct } from '../types'

export type ProductActionsProps = {
  /** Archivar o reactivar. Sin esta función no se muestra el botón. */
  onToggleStatus?: (product: AdminProduct) => void
}

const iconProps = { 'aria-hidden': true, size: 16, strokeWidth: 1.75 } as const

export default function ProductActions({
  product,
  onToggleStatus,
}: ProductActionsProps & { product: AdminProduct }) {
  const action = product.active ? 'Archivar' : 'Reactivar'

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/admin/productos/${product.id}/editar`}
        aria-label={`Editar «${product.name}»`}
        className={buttonClass('secondary', 'sm')}
      >
        <Pencil {...iconProps} />
        Editar
      </Link>
      {onToggleStatus && (
        <Button
          variant="ghost"
          size="sm"
          aria-label={`${action} «${product.name}»`}
          onClick={() => onToggleStatus(product)}
        >
          {product.active ? <Archive {...iconProps} /> : <ArchiveRestore {...iconProps} />}
          {action}
        </Button>
      )}
    </div>
  )
}
