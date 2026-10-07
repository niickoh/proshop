import { clsx } from 'clsx'
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
      {CATEGORIES.map((category) => {
        const isSelected = selected.includes(category)
        return (
          <li key={category} className="shrink-0 snap-start">
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(category)}
              className={clsx(
                'min-h-11 rounded-full border px-4 text-sm font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none',
                isSelected
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-700',
              )}
            >
              {CATEGORY_LABELS[category]}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
