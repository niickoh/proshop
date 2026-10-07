import type { ComponentProps } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from './cn'
import { fieldClass } from './styles'

type Props = ComponentProps<'select'> & {
  invalid?: boolean
  /** Clases del contenedor (ancho, márgenes). */
  wrapperClassName?: string
}

export default function Select({ invalid, className, wrapperClassName, ...props }: Props) {
  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      <select
        aria-invalid={invalid || undefined}
        className={cn(fieldClass(invalid), 'appearance-none pr-10', className)}
        {...props}
      />
      <ChevronDown
        aria-hidden="true"
        size={20}
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500"
      />
    </div>
  )
}
