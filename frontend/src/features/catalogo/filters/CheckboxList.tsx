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
    <ul className="space-y-0.5">
      {options.map((option) => (
        <li key={option.value}>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-gray-700 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="size-4 rounded border-gray-300 accent-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
            {option.label}
          </label>
        </li>
      ))}
    </ul>
  )
}
