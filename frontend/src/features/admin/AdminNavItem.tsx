import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import Badge from '../../shared/ui/Badge'
import { cn } from '../../shared/ui/cn'
import { focusRing, transition } from '../../shared/ui/styles'

type Props = {
  to: string
  label: string
  icon: LucideIcon
  /** Sección aún no disponible: atenuada, con badge y sin navegación. */
  comingSoon?: boolean
  onNavigate?: () => void
}

const base = 'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium'

export default function AdminNavItem({ to, label, icon: Icon, comingSoon, onNavigate }: Props) {
  const icon = <Icon aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0" />

  if (comingSoon) {
    return (
      <a role="link" aria-disabled="true" className={cn(base, 'cursor-not-allowed text-slate-400')}>
        {icon}
        <span className="min-w-0 flex-1 break-words">{label}</span>
        <Badge className="bg-slate-100 font-medium text-slate-500">Próximamente</Badge>
      </a>
    )
  }

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          base,
          transition,
          focusRing,
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )
      }
    >
      {icon}
      <span className="min-w-0 flex-1 break-words">{label}</span>
    </NavLink>
  )
}
