import { clsx } from 'clsx'
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

const focusRing =
  'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none'

export default function ResultsToolbar({
  total,
  sort,
  onSortChange,
  onOpenFilters,
  activeCount,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p aria-live="polite" className="text-sm text-gray-600">
        {total === undefined ? ' ' : `${total} ${total === 1 ? 'resultado' : 'resultados'}`}
      </p>

      <div className="flex items-center gap-2">
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className={clsx(
              'flex min-h-11 min-w-11 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden',
              focusRing,
            )}
          >
            Filtros
            {activeCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                ({activeCount})
              </span>
            )}
          </button>
        )}
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="sr-only sm:not-sr-only">Ordenar por</span>
          <select
            aria-label="Ordenar por"
            value={sort ?? 'relevancia'}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className={clsx(
              'min-h-11 max-w-44 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 sm:max-w-none',
              focusRing,
            )}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
