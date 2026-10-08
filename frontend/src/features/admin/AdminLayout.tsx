import { Suspense, useId } from 'react'
import { Menu, X } from 'lucide-react'
import { Outlet } from 'react-router'
import Button from '../../shared/ui/Button'
import IconButton from '../../shared/ui/IconButton'
import AdminNotice from './AdminNotice'
import AdminSidebar from './AdminSidebar'
import { useAdminMenu } from './hooks/useAdminMenu'

export default function AdminLayout() {
  const { isOpen, open, close, containerRef } = useAdminMenu()
  const drawerId = useId()
  const titleId = useId()

  return (
    <div className="py-6 lg:flex lg:items-start lg:gap-8 lg:py-8">
      {/* Desde lg: barra fija a la izquierda. */}
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:w-64 lg:shrink-0">
        <AdminSidebar />
      </aside>

      <div className="min-w-0 flex-1">
        {/* Móvil: el menú es un drawer. */}
        <Button
          variant="secondary"
          size="sm"
          aria-expanded={isOpen}
          aria-controls={drawerId}
          onClick={open}
          className="mb-4 lg:hidden"
        >
          <Menu aria-hidden="true" size={20} strokeWidth={1.75} />
          Menú de administración
        </Button>

        <Suspense fallback={<p className="py-8">Cargando…</p>}>
          <Outlet />
        </Suspense>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-60 lg:hidden">
          <div
            aria-hidden="true"
            onClick={close}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <div
            id={drawerId}
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto rounded-r-2xl bg-white p-4 shadow-xl"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 id={titleId} className="text-lg font-semibold text-slate-900">
                Menú de administración
              </h2>
              <IconButton aria-label="Cerrar menú de administración" onClick={close}>
                <X aria-hidden="true" size={20} strokeWidth={1.75} />
              </IconButton>
            </div>
            <AdminSidebar onNavigate={close} />
          </div>
        </div>
      )}

      <AdminNotice />
    </div>
  )
}
