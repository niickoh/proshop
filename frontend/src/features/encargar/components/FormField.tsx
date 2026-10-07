import { useId, type ReactNode } from 'react'
import { clsx } from 'clsx'

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
    <div className={clsx('min-w-0 space-y-1', className)}>
      <div className="flex items-baseline gap-0.5">
        <label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label}
        </label>
        {required && (
          <span aria-hidden="true" className="text-sm text-red-700">
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
        <p id={helpId} className="text-sm text-gray-600">
          {help}
        </p>
      )}
      <div aria-live="polite">
        {error && (
          <p id={errorId} className="text-sm font-medium break-words text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
