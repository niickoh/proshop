import { X } from 'lucide-react'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import IconButton from '../../../shared/ui/IconButton'
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
    <div className="space-y-2">
      <CategoryFilter {...props} />
      <GenderFilter {...props} />
      <SizeFilter {...props} />
      <ColorFilter {...props} />
      <BrandFilter {...props} />
      <PriceFilter {...props} />
      <AvailabilityFilter {...props} />
    </div>
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

export default function FiltersPanel(props: Props) {
  if (props.mode === 'sidebar') {
    return (
      <aside aria-label="Filtros" className="sticky top-20 w-64 shrink-0 self-start">
        <Card className="max-h-[calc(100dvh-6rem)] overflow-y-auto p-3">
          <h2 className="sr-only">Filtros</h2>
          <Filters filters={props.filters} onChange={props.onChange} />
        </Card>
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
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
        className="absolute inset-y-0 left-0 flex w-[85vw] max-w-sm flex-col rounded-r-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">Filtros</h2>
          <IconButton aria-label="Cerrar filtros" onClick={onClose}>
            <X aria-hidden="true" size={20} strokeWidth={1.75} />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <Filters filters={filters} onChange={onChange} />
        </div>

        <div className="flex gap-2 border-t border-slate-200 p-4">
          <Button variant="secondary" onClick={onClear} className="flex-1 px-3">
            Limpiar
          </Button>
          <Button onClick={onApply} disabled={!isValid} className="flex-2 px-3">
            {count === undefined ? 'Ver resultados' : `Ver ${count} resultados`}
          </Button>
        </div>
      </div>
    </div>
  )
}
