import NavItem, { type NavOptionProps } from '../NavItem'

export default function NavEncargar({ onNavigate }: NavOptionProps) {
  return <NavItem to="/encargar" label="Encargar" onNavigate={onNavigate} />
}
