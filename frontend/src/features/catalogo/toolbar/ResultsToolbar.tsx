import { SlidersHorizontal } from 'lucide-react'
import Badge from '../../../shared/ui/Badge'
import Button from '../../../shared/ui/Button'
import Select from '../../../shared/ui/Select'
import { SORT_LABELS } from '../data/filterOptions'
import { SORT_OPTIONS, type SortOption } from '../types'

type Props = {
  total: number | undefined
  sort: SortOption | undefined
  onSortChange: (sort: SortOption) => void
  /** Solo en móvil: abre el drawer de filtros. */
  onOpenFilters?: () => void
  activeCount: number
}

export default function ResultsToolbar({
  total,
  sort,
  onSortChange,
  onOpenFilters,
  activeCount,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" className="text-sm font-medium text-slate-500 tabular-nums">
        {total === undefined ? ' ' : `${total} ${total === 1 ? 'resultado' : 'resultados'}`}
      </p>

      <div className="flex min-w-0 items-center gap-2">
        {onOpenFilters && (
          <Button variant="secondary" size="sm" onClick={onOpenFilters} className="lg:hidden">
            <SlidersHorizontal aria-hidden="true" size={20} strokeWidth={1.75} />
            Filtros
            {activeCount > 0 && <Badge tone="brand">({activeCount})</Badge>}
          </Button>
        )}
        <label className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Ordenar por</span>
          <Select
            aria-label="Ordenar por"
            value={sort ?? 'relevancia'}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            wrapperClassName="w-auto min-w-0"
            className="pr-9 pl-3"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </Select>
        </label>
      </div>
    </div>
  )
}
