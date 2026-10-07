import type { ComponentProps } from 'react'
import { cn } from './cn'
import { focusRing, transition } from './styles'

type Props = Omit<ComponentProps<'button'>, 'aria-pressed'> & {
  selected: boolean
}

/** Opción seleccionable en forma de píldora (filtros, tallas). */
export default function Chip({ selected, type = 'button', className, ...props }: Props) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        // 44px de área táctil en móvil; 36px desde md.
        'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-medium ring-1 md:h-9 md:min-h-9',
        'disabled:cursor-not-allowed disabled:opacity-50',
        transition,
        focusRing,
        selected
          ? 'bg-brand-600 text-white ring-brand-600'
          : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
        className,
      )}
      {...props}
    />
  )
}
