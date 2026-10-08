import NavItem, { type NavOptionProps } from '../NavItem'

// Por ahora visible para todos; con el login se definirá quién la ve.
export default function NavAdministracion({ onNavigate }: NavOptionProps) {
  return <NavItem to="/admin" label="Administración" onNavigate={onNavigate} />
}
