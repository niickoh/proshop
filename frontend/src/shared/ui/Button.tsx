import type { ComponentProps } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from './cn'
import { buttonClass, type ButtonSize, type ButtonVariant } from './styles'

export type { ButtonSize }

type Props = ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Deshabilita el botón y muestra un spinner. */
  loading?: boolean
  fullWidth?: boolean
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
      className={cn(buttonClass(variant, size), fullWidth && 'w-full', className)}
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
