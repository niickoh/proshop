import { useCallback, useState } from 'react'
import { useFocusTrap } from '../../catalogo/hooks/useFocusTrap'

/** Drawer del menú de administración en móvil: atrapa el foco y cierra con Escape. */
export function useAdminMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen, close)

  return { isOpen, open, close, containerRef }
}
