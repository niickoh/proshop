import { useEffect, useRef } from 'react'
import { useFocusTrap } from '../../catalogo/hooks/useFocusTrap'
import { useCartStore } from '../store/cartStore'

/** id del ícono del header: al cerrar el drawer el foco vuelve ahí, sin importar quién lo abrió. */
export const CART_BUTTON_ID = 'cart-button'

export function useCartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen)
  const close = useCartStore((s) => s.closeDrawer)
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen, close)
  const wasOpen = useRef(false)

  // Corre después de la limpieza del focus trap, así que gana sobre el foco previo.
  useEffect(() => {
    if (wasOpen.current && !isOpen) document.getElementById(CART_BUTTON_ID)?.focus()
    wasOpen.current = isOpen
  }, [isOpen])

  return { isOpen, close, containerRef }
}
