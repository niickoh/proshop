import Chip from '../../../shared/ui/Chip'
import { CATEGORY_LABELS } from '../data/filterOptions'
import { CATEGORIES } from '../types'

type Props = {
  selected: string[] | undefined
  onChange: (category: string[]) => void
}

/** Fila de categorías con scroll horizontal sobre la grilla (solo móvil). */
export default function CategoryChips({ selected = [], onChange }: Props) {
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])

  return (
    <ul
      aria-label="Categorías"
      className="-mx-4 flex snap-x [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-1 sm:-mx-6 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
    >
      {CATEGORIES.map((category) => (
        <li key={category} className="shrink-0 snap-start">
          <Chip
            selected={selected.includes(category)}
            onClick={() => toggle(category)}
            className="whitespace-nowrap"
          >
            {CATEGORY_LABELS[category]}
          </Chip>
        </li>
      ))}
    </ul>
  )
}
