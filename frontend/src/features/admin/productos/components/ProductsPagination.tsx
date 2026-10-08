import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../../../../shared/ui/Button'
import { getPageItems } from '../pagination'

type Props = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function ProductsPagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-center gap-1">
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.75} />
        Anterior
      </Button>
      <ul className="flex flex-wrap items-center gap-1">
        {getPageItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-slate-400">
              …
            </li>
          ) : (
            <li key={item}>
              <Button
                variant={item === page ? 'primary' : 'ghost'}
                size="sm"
                aria-label={`Página ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
                className="min-w-11 px-0 md:min-w-9"
              >
                {item}
              </Button>
            </li>
          ),
        )}
      </ul>
      <Button
        variant="ghost"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
        <ChevronRight aria-hidden="true" size={16} strokeWidth={1.75} />
      </Button>
    </nav>
  )
}
