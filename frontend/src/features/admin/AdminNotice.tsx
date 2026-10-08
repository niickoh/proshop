import { useEffect } from 'react'
import { CircleCheck, X } from 'lucide-react'
import Button from '../../shared/ui/Button'
import IconButton from '../../shared/ui/IconButton'
import { NOTICE_DURATION_MS, useAdminNotice } from './hooks/useAdminNotice'

/** Aviso flotante del panel, con acción opcional ("Deshacer"). Se oculta a los 5 segundos. */
export default function AdminNotice() {
  const notice = useAdminNotice((state) => state.notice)
  const dismissNotice = useAdminNotice((state) => state.dismissNotice)

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(dismissNotice, NOTICE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [notice, dismissNotice])

  // La región existe siempre para que los lectores de pantalla anuncien cada aviso.
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-70 flex justify-center sm:inset-x-auto sm:right-6"
    >
      {notice && (
        <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-slate-900 py-2 pr-2 pl-4 text-sm text-white shadow-xl">
          <CircleCheck aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0" />
          <p className="min-w-0 flex-1 break-words">{notice.message}</p>
          {notice.action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                notice.action?.onClick()
                dismissNotice()
              }}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              {notice.action.label}
            </Button>
          )}
          <IconButton
            aria-label="Cerrar aviso"
            size="sm"
            onClick={dismissNotice}
            className="text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X aria-hidden="true" size={16} strokeWidth={1.75} />
          </IconButton>
        </div>
      )}
    </div>
  )
}
