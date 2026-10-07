import { useCallback, useEffect, useRef, useState } from 'react'
import { useCartStore } from '../store/cartStore'
import type { CartItem } from '../types'

export const UNDO_TIMEOUT_MS = 5000

type Removed = { item: CartItem; index: number }

/** Elimina una línea y permite deshacerlo durante 5 segundos, restaurándola en su posición. */
export function useUndoRemove() {
  const removeItem = useCartStore((s) => s.removeItem)
  const restoreItem = useCartStore((s) => s.restoreItem)
  const [removed, setRemoved] = useState<Removed | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const undoButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // El botón eliminado desaparece: el foco pasa a "Deshacer" para no perderlo.
  useEffect(() => {
    if (removed) undoButtonRef.current?.focus()
  }, [removed])

  const remove = useCallback(
    (item: CartItem, index: number) => {
      removeItem(item.productId, item.size)
      setRemoved({ item, index })
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setRemoved(null), UNDO_TIMEOUT_MS)
    },
    [removeItem],
  )

  const undo = useCallback(() => {
    if (!removed) return
    window.clearTimeout(timer.current)
    restoreItem(removed.item, removed.index)
    setRemoved(null)
  }, [removed, restoreItem])

  return { removed, remove, undo, undoButtonRef }
}
