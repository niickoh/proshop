import { CART_STORAGE_KEY, useCartStore } from './store/cartStore'
import { selectItemCount, selectSavings, selectSubtotal } from './store/selectors'
import type { CartItem } from './types'

const polera: Omit<CartItem, 'quantity'> = {
  productId: 'p1',
  size: 'M',
  name: 'Polera básica',
  brand: 'Marca',
  image: '/img/p1.jpg',
  price: 10000,
}
const chaqueta: Omit<CartItem, 'quantity'> = {
  productId: 'p2',
  size: 'L',
  name: 'Chaqueta',
  brand: 'Otra',
  image: '/img/p2.jpg',
  price: 30000,
  compareAtPrice: 40000,
}

const store = () => useCartStore.getState()

beforeEach(() => {
  localStorage.clear()
  useCartStore.setState({ items: [], isDrawerOpen: false })
})

describe('cartStore', () => {
  it('agrega un producto con cantidad 1 por defecto', () => {
    store().addItem(polera)
    expect(store().items).toEqual([{ ...polera, quantity: 1 }])
  })

  it('mismo producto y talla suma la cantidad', () => {
    store().addItem(polera)
    store().addItem(polera, 2)
    expect(store().items).toHaveLength(1)
    expect(store().items[0].quantity).toBe(3)
  })

  it('otra talla crea una línea nueva', () => {
    store().addItem(polera)
    store().addItem({ ...polera, size: 'L' })
    expect(store().items.map((i) => i.size)).toEqual(['M', 'L'])
  })

  it('no supera 10 unidades por línea', () => {
    store().addItem(polera, 8)
    store().addItem(polera, 5)
    expect(store().items[0].quantity).toBe(10)
    store().updateQuantity('p1', 'M', 25)
    expect(store().items[0].quantity).toBe(10)
    store().updateQuantity('p1', 'M', 0)
    expect(store().items[0].quantity).toBe(1)
  })

  it('elimina una línea y la restaura en la misma posición', () => {
    store().addItem(polera)
    store().addItem(chaqueta)
    store().addItem({ ...polera, size: 'S' })
    const removed = store().items[1]
    store().removeItem('p2', 'L')
    expect(store().items.map((i) => i.productId)).toEqual(['p1', 'p1'])
    store().restoreItem(removed, 1)
    expect(store().items[1]).toEqual(removed)
  })

  it('actualiza la cantidad de una línea', () => {
    store().addItem(polera)
    store().updateQuantity('p1', 'M', 4)
    expect(store().items[0].quantity).toBe(4)
  })

  it('vacía el carrito y abre/cierra el drawer', () => {
    store().addItem(polera)
    store().clear()
    expect(store().items).toEqual([])
    store().openDrawer()
    expect(store().isDrawerOpen).toBe(true)
    store().closeDrawer()
    expect(store().isDrawerOpen).toBe(false)
  })

  it('calcula unidades, subtotal y ahorro', () => {
    store().addItem(polera, 2)
    store().addItem(chaqueta, 3)
    expect(selectItemCount(store())).toBe(5)
    expect(selectSubtotal(store())).toBe(2 * 10000 + 3 * 30000)
    expect(selectSavings(store())).toBe(3 * 10000)
  })

  it('persiste los productos en localStorage pero no el estado del drawer', async () => {
    store().addItem(polera)
    store().openDrawer()
    const raw = localStorage.getItem(CART_STORAGE_KEY) ?? '{}'
    const saved = JSON.parse(raw)
    expect(saved.state).toEqual({ items: [{ ...polera, quantity: 1 }] })
    expect(saved.version).toEqual(expect.any(Number))

    // Simula una recarga: memoria vacía y localStorage con lo guardado.
    useCartStore.setState({ items: [], isDrawerOpen: false })
    localStorage.setItem(CART_STORAGE_KEY, raw)
    await useCartStore.persist.rehydrate()
    expect(store().items).toEqual([{ ...polera, quantity: 1 }])
    expect(store().isDrawerOpen).toBe(false)
  })
})
