import NavItem, { type NavOptionProps } from '../NavItem'

export default function NavComprar({ onNavigate }: NavOptionProps) {
  return <NavItem to="/comprar" label="Comprar" onNavigate={onNavigate} />
}
