import NavItem, { type NavOptionProps } from '../NavItem'

export default function NavContacto({ onNavigate }: NavOptionProps) {
  return <NavItem to="/contacto" label="Contáctanos" onNavigate={onNavigate} />
}
