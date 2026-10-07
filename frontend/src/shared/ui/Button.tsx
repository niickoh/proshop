import type { ComponentProps } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from './cn'
import { buttonVariants, focusRing, transition, type ButtonVariant } from './styles'

export type ButtonSize = 'sm' | 'md' | 'lg'

type Props = ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Deshabilita el botón y muestra un spinner. */
  loading?: boolean
  fullWidth?: boolean
}

// sm conserva 44px de alto en móvil (área táctil) y baja a 36px desde md.
const sizes: Record<ButtonSize, string> = {
  sm: 'h-11 px-3 text-sm md:h-9',
  md: 'h-11 px-5 text-sm md:text-base',
  lg: 'h-12 px-6 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold break-words',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:active:scale-100',
        transition,
        focusRing,
        buttonVariants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && (
        <LoaderCircle
          aria-hidden="true"
          size={20}
          strokeWidth={1.75}
          className="animate-spin motion-reduce:animate-none"
        />
      )}
      {children}
    </button>
  )
}
