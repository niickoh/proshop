// Modelo del carrito. Vive en el navegador; será la base del futuro `POST /api/orders`.

export const MAX_QUANTITY = 10

export type CartItem = {
  productId: string
  size: string
  name: string
  brand: string
  image: string
  /** CLP al momento de agregar */
  price: number
  compareAtPrice?: number
  /** 1 a 10 */
  quantity: number
}

export type CartStore = {
  items: CartItem[]
  isDrawerOpen: boolean
  addItem(item: Omit<CartItem, 'quantity'>, quantity?: number): void
  removeItem(productId: string, size: string): void
  /** Vuelve a insertar una línea eliminada en su posición original (para "Deshacer"). */
  restoreItem(item: CartItem, index: number): void
  updateQuantity(productId: string, size: string, quantity: number): void
  clear(): void
  openDrawer(): void
  closeDrawer(): void
}

/** Estado de ruta de "Comprar ahora" hacia `/checkout`. */
export type BuyNowState = { buyNow: CartItem }
