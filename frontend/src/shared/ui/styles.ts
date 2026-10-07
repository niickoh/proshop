import { cn } from './cn'

/** Anillo de foco de la marca, común a todos los controles. */
export const focusRing =
  'focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:outline-none'

/** Transición corta; sin movimiento con prefers-reduced-motion. */
export const transition = 'transition duration-200 ease-out motion-reduce:transition-none'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

/** Colores por variante, compartidos por Button e IconButton. */
export const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:hover:bg-brand-600',
  secondary: 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
}

export type ButtonSize = 'sm' | 'md' | 'lg'

// sm conserva 44px de alto en móvil (área táctil) y baja a 36px desde md.
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-11 px-3 text-sm md:h-9',
  md: 'h-11 px-5 text-sm md:text-base',
  lg: 'h-12 px-6 text-base',
}

/** Clases de Button; también sirven para dar aspecto de botón a un Link. */
export const buttonClass = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md') =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold break-words',
    'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:active:scale-100',
    transition,
    focusRing,
    buttonVariants[variant],
    buttonSizes[size],
  )

/** Estilos de campo compartidos por Input y Select (alto 44px, text-base evita el zoom de iOS). */
export const fieldClass = (invalid = false) =>
  cn(
    'h-11 w-full rounded-xl border bg-white px-4 text-base text-slate-900 placeholder:text-slate-400',
    'focus:ring-4 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
    transition,
    invalid
      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
      : 'border-slate-200 focus:border-brand-600 focus:ring-brand-100',
  )
