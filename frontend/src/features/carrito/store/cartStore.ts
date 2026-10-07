import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { MAX_QUANTITY, type CartItem, type CartStore } from '../types'

export const CART_STORAGE_KEY = 'proshop-cart'
const CART_STORAGE_VERSION = 1

const clampQuantity = (quantity: number) => Math.min(MAX_QUANTITY, Math.max(1, quantity))

const isLine = (item: CartItem, productId: string, size: string) =>
  item.productId === productId && item.size === size

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item, quantity = 1) =>
        set(({ items }) => {
          const existing = items.find((i) => isLine(i, item.productId, item.size))
          if (!existing)
            return { items: [...items, { ...item, quantity: clampQuantity(quantity) }] }
          return {
            items: items.map((i) =>
              i === existing ? { ...i, quantity: clampQuantity(i.quantity + quantity) } : i,
            ),
          }
        }),

      removeItem: (productId, size) =>
        set(({ items }) => ({ items: items.filter((i) => !isLine(i, productId, size)) })),

      restoreItem: (item, index) =>
        set(({ items }) => {
          // Si la línea se volvió a agregar mientras tanto, se suman las cantidades.
          const rest = items.filter((i) => !isLine(i, item.productId, item.size))
          const current = items.find((i) => isLine(i, item.productId, item.size))
          const restored = {
            ...item,
            quantity: clampQuantity(item.quantity + (current?.quantity ?? 0)),
          }
          return { items: [...rest.slice(0, index), restored, ...rest.slice(index)] }
        }),

      updateQuantity: (productId, size, quantity) =>
        set(({ items }) => ({
          items: items.map((i) =>
            isLine(i, productId, size) ? { ...i, quantity: clampQuantity(quantity) } : i,
          ),
        })),

      clear: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: CART_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // El drawer no se persiste: siempre arranca cerrado.
      partialize: ({ items }) => ({ items }),
      // Punto de entrada para futuras migraciones del formato guardado.
      migrate: (persisted) => persisted as Pick<CartStore, 'items'>,
    },
  ),
)
