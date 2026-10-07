import type { ComponentProps } from 'react'
import { cn } from './cn'
import { buttonVariants, focusRing, transition, type ButtonVariant } from './styles'

type Props = ComponentProps<'button'> & {
  /** Obligatorio: el botón solo muestra un ícono. */
  'aria-label': string
  variant?: ButtonVariant
  size?: 'sm' | 'md'
}

// sm se usa dentro de controles compactos; en móvil mantiene 44px.
const sizes = {
  sm: 'min-h-11 min-w-11 md:min-h-9 md:min-w-9',
  md: 'min-h-11 min-w-11',
}

/** Botón redondo para íconos (lucide-react, 20px). */
export default function IconButton({
  variant = 'ghost',
  size = 'md',
  type = 'button',
  className,
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
        transition,
        focusRing,
        buttonVariants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
