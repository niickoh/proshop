import { clsx } from 'clsx'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { FiltersChange, ProductFilters } from '../types'
import AvailabilityFilter from './AvailabilityFilter'
import BrandFilter from './BrandFilter'
import CategoryFilter from './CategoryFilter'
import ColorFilter from './ColorFilter'
import GenderFilter from './GenderFilter'
import PriceFilter from './PriceFilter'
import SizeFilter from './SizeFilter'

type FiltersProps = { filters: ProductFilters; onChange: FiltersChange }

function Filters(props: FiltersProps) {
  return (
    <>
      <CategoryFilter {...props} />
      <GenderFilter {...props} />
      <SizeFilter {...props} />
      <ColorFilter {...props} />
      <BrandFilter {...props} />
      <PriceFilter {...props} />
      <AvailabilityFilter {...props} />
    </>
  )
}

type Props = FiltersProps &
  (
    | { mode: 'sidebar' }
    | {
        mode: 'drawer'
        open: boolean
        isValid: boolean
        count: number | undefined
        onClose: () => void
        onClear: () => void
        onApply: () => void
      }
  )

const focusRing =
  'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none'

export default function FiltersPanel(props: Props) {
  if (props.mode === 'sidebar') {
    return (
      <aside
        aria-label="Filtros"
        className="sticky top-16 max-h-[calc(100dvh-5rem)] w-64 shrink-0 self-start overflow-y-auto pr-2"
      >
        <h2 className="sr-only">Filtros</h2>
        <Filters filters={props.filters} onChange={props.onChange} />
      </aside>
    )
  }
  return props.open ? <FiltersDrawer {...props} /> : null
}

function FiltersDrawer({
  filters,
  onChange,
  isValid,
  count,
  onClose,
  onClear,
  onApply,
}: Extract<Props, { mode: 'drawer' }>) {
  const containerRef = useFocusTrap<HTMLDivElement>(true, onClose)

  return (
    <div className="fixed inset-0 z-50">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
        className="absolute inset-y-0 left-0 flex w-[85vw] max-w-sm flex-col bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <button
            type="button"
            aria-label="Cerrar filtros"
            onClick={onClose}
            className={clsx(
              'flex min-h-11 min-w-11 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100',
              focusRing,
            )}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <Filters filters={filters} onChange={onChange} />
        </div>

        <div className="flex gap-2 border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={onClear}
            className={clsx(
              'min-h-11 flex-1 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50',
              focusRing,
            )}
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={!isValid}
            className={clsx(
              'min-h-11 flex-2 rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50',
              focusRing,
            )}
          >
            {count === undefined ? 'Ver resultados' : `Ver ${count} resultados`}
          </button>
        </div>
      </div>
    </div>
  )
}
