import { useUndoRemove } from '../hooks/useUndoRemove'
import { useCartStore } from '../store/cartStore'
import CartItemRow from './CartItemRow'
import EmptyCart from './EmptyCart'

export default function CartItemList() {
  const items = useCartStore((s) => s.items)
  const { removed, remove, undo, undoButtonRef } = useUndoRemove()

  return (
    <>
      <div role="status" aria-live="polite">
        {removed && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-900 py-1 pr-1 pl-4 text-sm text-white">
            <span>Producto eliminado</span>
            <button
              ref={undoButtonRef}
              type="button"
              onClick={undo}
              className="min-h-11 rounded-md px-3 font-semibold underline hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              Deshacer
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <ul aria-label="Productos en el carrito" className="divide-y divide-gray-200">
          {items.map((item, index) => (
            <CartItemRow
              key={`${item.productId}-${item.size}`}
              item={item}
              onRemove={() => remove(item, index)}
            />
          ))}
        </ul>
      )}
    </>
  )
}
