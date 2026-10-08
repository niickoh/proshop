import { Link } from 'react-router'
import { Menu, X } from 'lucide-react'
import CartButton from '../../../features/carrito/components/CartButton'
import IconButton from '../../ui/IconButton'
import { cn } from '../../ui/cn'
import { focusRing } from '../../ui/styles'
import { useMobileMenu } from './useMobileMenu'
import NavComprar from './options/NavComprar'
import NavEncargar from './options/NavEncargar'
import NavAdministracion from './options/NavAdministracion'

export default function Header() {
  const { isOpen, toggle, close, containerRef } = useMobileMenu<HTMLElement>()

  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md"
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={close}
          className={cn(
            'flex min-h-11 min-w-11 items-center rounded-xl text-xl font-bold tracking-tight text-slate-900',
            focusRing,
          )}
        >
          ProShop
        </Link>

        <IconButton
          aria-label="Abrir menú"
          aria-expanded={isOpen}
          aria-controls="menu-principal"
          onClick={toggle}
          className="order-2 md:hidden"
        >
          {isOpen ? (
            <X aria-hidden="true" size={20} strokeWidth={1.75} />
          ) : (
            <Menu aria-hidden="true" size={20} strokeWidth={1.75} />
          )}
        </IconButton>

        {/* Móvil: panel bajo el header. Desde md: opciones en línea a la derecha. */}
        <nav
          id="menu-principal"
          aria-label="Principal"
          className={cn(
            'absolute inset-x-0 top-full order-3 flex-col gap-1 rounded-b-2xl bg-white px-4 py-3 shadow-lg',
            'md:static md:order-2 md:ml-auto md:flex md:flex-row md:gap-2 md:rounded-none md:bg-transparent md:p-0 md:shadow-none',
            isOpen ? 'flex' : 'hidden',
          )}
        >
          <NavComprar onNavigate={close} />
          <NavEncargar onNavigate={close} />
          <NavAdministracion onNavigate={close} />
        </nav>

        {/* Móvil: se ordena junto al botón de menú; desde md, a la derecha del menú. */}
        <CartButton className="order-1 ml-auto md:order-3 md:ml-2" />
      </div>
    </header>
  )
}
