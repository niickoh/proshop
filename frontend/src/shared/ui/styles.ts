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
