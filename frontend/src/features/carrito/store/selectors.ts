import type { CartStore } from '../types'

type CartState = Pick<CartStore, 'items'>

/** Suma de unidades de todas las líneas. */
export const selectItemCount = ({ items }: CartState) =>
  items.reduce((sum, item) => sum + item.quantity, 0)

/** Suma de precio × cantidad, en CLP. */
export const selectSubtotal = ({ items }: CartState) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)

/** Ahorro total frente al precio anterior de los productos en oferta. */
export const selectSavings = ({ items }: CartState) =>
  items.reduce(
    (sum, { price, compareAtPrice, quantity }) =>
      compareAtPrice !== undefined && compareAtPrice > price
        ? sum + (compareAtPrice - price) * quantity
        : sum,
    0,
  )
