import { useId } from 'react'
import { cn } from '../../../../../shared/ui/cn'
import { focusRing, transition } from '../../../../../shared/ui/styles'

type Props = {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/** Interruptor accesible (`role="switch"`), con texto y descripción. */
export default function SwitchField({ label, description, checked, onChange }: Props) {
  const labelId = useId()
  const descriptionId = useId()

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p id={labelId} className="text-sm font-medium text-slate-900">
          {label}
        </p>
        <p id={descriptionId} className="text-sm text-slate-500">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        onClick={() => onChange(!checked)}
        className={cn(
          'flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full',
          focusRing,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex h-6 w-11 items-center rounded-full p-0.5',
            transition,
            checked ? 'bg-brand-600' : 'bg-slate-300',
          )}
        >
          <span
            className={cn(
              'size-5 rounded-full bg-white shadow-sm',
              transition,
              checked && 'translate-x-5',
            )}
          />
        </span>
      </button>
    </div>
  )
}
