import {
  ClipboardList,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Users,
  Warehouse,
} from 'lucide-react'
import AdminNavItem from './AdminNavItem'

const ITEMS = [
  { to: '/admin/resumen', label: 'Resumen', icon: LayoutDashboard, comingSoon: true },
  { to: '/admin/productos', label: 'Productos', icon: Package, comingSoon: false },
  { to: '/admin/ventas', label: 'Ventas', icon: Receipt, comingSoon: true },
  { to: '/admin/encargos', label: 'Encargos', icon: ClipboardList, comingSoon: true },
  { to: '/admin/clientes', label: 'Clientes', icon: Users, comingSoon: true },
  { to: '/admin/inventario', label: 'Inventario', icon: Warehouse, comingSoon: true },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings, comingSoon: true },
] as const

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Administración">
      <ul className="space-y-1">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <AdminNavItem {...item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
