import { NavLink } from 'react-router'
import { cn } from '../../ui/cn'
import { focusRing, transition } from '../../ui/styles'

export interface NavItemProps {
  to: string
  label: string
  onNavigate?: () => void
}

export interface NavOptionProps {
  onNavigate?: () => void
}

export default function NavItem({ to, label, onNavigate }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'relative flex min-h-11 w-full min-w-11 items-center rounded-xl px-4 py-3 text-base font-medium md:w-auto md:py-0 md:text-sm',
          // Activa: texto de marca con un subrayado fino, sin fondo en bloque.
          'after:absolute after:inset-x-4 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-brand-600 after:opacity-0',
          transition,
          focusRing,
          isActive ? 'text-brand-600 after:opacity-100' : 'text-slate-600 hover:text-slate-900',
        )
      }
    >
      {label}
    </NavLink>
  )
}
