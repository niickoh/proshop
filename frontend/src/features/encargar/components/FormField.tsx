import { useId, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { CircleAlert } from 'lucide-react'
import { cn } from '../../../shared/ui/cn'

/** Props de accesibilidad que FormField entrega al control (input, select, etc.). */
export type FieldControlProps = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
  'aria-required'?: true
}

type Props = {
  label: string
  required?: boolean
  /** Texto de ayuda bajo el control. */
  help?: string
  error?: string
  className?: string
  children: (control: FieldControlProps) => ReactNode
}

/** Base de los campos de formulario: label + control + ayuda + error. */
export default function FormField({ label, required, help, error, className, children }: Props) {
  const id = useId()
  const helpId = `${id}-ayuda`
  const errorId = `${id}-error`
  const describedBy = clsx(help && helpId, error && errorId) || undefined

  return (
    <div className={cn('min-w-0 space-y-1.5', className)}>
      <div className="flex items-baseline gap-0.5">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {required && (
          <span aria-hidden="true" className="text-sm text-red-600">
            *
          </span>
        )}
      </div>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}
      {help && (
        <p id={helpId} className="text-xs font-medium text-slate-500">
          {help}
        </p>
      )}
      <div aria-live="polite">
        {error && (
          <p id={errorId} className="flex items-start gap-1.5 text-sm break-words text-red-600">
            <CircleAlert
              aria-hidden="true"
              size={16}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0"
            />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
