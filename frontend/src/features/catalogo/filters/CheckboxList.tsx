import { cn } from '../../../shared/ui/cn'
import { focusRing, transition } from '../../../shared/ui/styles'

type Option = { value: string; label: string }

type Props = {
  options: Option[]
  selected: string[] | undefined
  onChange: (selected: string[]) => void
}

/** Lista de checkboxes reutilizada por los filtros de selección múltiple. */
export default function CheckboxList({ options, selected = [], onChange }: Props) {
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])

  return (
    <ul className="-mx-2 space-y-0.5">
      {options.map((option) => (
        <li key={option.value}>
          <label
            className={cn(
              'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 text-sm text-slate-700 hover:bg-slate-50',
              transition,
            )}
          >
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => toggle(option.value)}
              className={cn('size-4 rounded accent-brand-600', focusRing)}
            />
            {option.label}
          </label>
        </li>
      ))}
    </ul>
  )
}
