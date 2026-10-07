import { lazy, Suspense } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { PRODUCTS } from '../catalogo/data/products'
import { formatPrice } from '../../shared/utils/formatPrice'
import Header from '../../shared/components/Header/Header'
import ProductoDetallePage from '../producto-detalle/ProductoDetallePage'
import CarritoPage from './CarritoPage'
import CartDrawer from './components/CartDrawer'
import { CART_STORAGE_KEY, useCartStore } from './store/cartStore'
import type { CartItem } from './types'

const CheckoutPage = lazy(() => import('../../app/pages/CheckoutPage'))

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const user = userEvent.setup()
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Header />
        <CartDrawer />
        <Suspense fallback={<p>Cargando…</p>}>
          <Routes>
            <Route path="/comprar/:id" element={<ProductoDetallePage />} />
            <Route path="/comprar" element={<p>Catálogo</p>} />
            <Route path="/carrito" element={<CarritoPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </Suspense>
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { user, ...utils }
}

const findProduct = (predicate: (p: (typeof PRODUCTS)[number]) => boolean) => {
  const product = PRODUCTS.find(predicate)
  if (!product) throw new Error('Faltan datos de ejemplo')
  return product
}
const multiSize = findProduct((p) => p.inStock && p.sizes.includes('M') && p.sizes.includes('L'))
const onSale = findProduct(
  (p) => p.inStock && p.compareAtPrice !== undefined && p.compareAtPrice > p.price,
)
const regular = findProduct(
  (p) => p.inStock && p.compareAtPrice === undefined && p.id !== multiSize.id,
)

const toItem = (p: (typeof PRODUCTS)[number], size: string, quantity: number): CartItem => ({
  productId: p.id,
  size,
  name: p.name,
  brand: p.brand,
  image: p.images[0],
  price: p.price,
  compareAtPrice: p.compareAtPrice,
  quantity,
})

const seed = (items: CartItem[]) => useCartStore.setState({ items })
const location = () => screen.getByTestId('location').textContent
const page = () => screen.getByRole('region', { name: 'Tu carrito' })
const cartIcon = () => within(screen.getByRole('banner')).getByRole('button', { name: /^Carrito/ })
const findDrawer = () => screen.findByRole('dialog', { name: /Tu carrito/ })
const getRows = () =>
  within(screen.getByRole('list', { name: 'Productos en el carrito' })).getAllByRole('listitem')
const summaryValue = (label: string) =>
  within(screen.getByRole('region', { name: 'Resumen de compra' })).getByText(label)
    .nextElementSibling

beforeEach(() => {
  localStorage.clear()
  useCartStore.setState({ items: [], isDrawerOpen: false })
})

describe('Carrito', () => {
  it('el ícono del carrito se ve en el header en móvil y escritorio, sin badge si está vacío', () => {
    renderAt('/comprar')
    const icon = cartIcon()
    expect(icon).toHaveAccessibleName('Carrito vacío')
    expect(icon.className).not.toMatch(/\bhidden\b/)
    expect(icon).toHaveClass('min-h-11', 'min-w-11')
    expect(within(icon).queryByText(/\d/)).not.toBeInTheDocument()
  })

  it('el badge muestra el total de unidades y "99+" si pasa de 99', () => {
    seed([toItem(multiSize, 'M', 3), toItem(onSale, onSale.sizes[0], 2)])
    const { unmount } = renderAt('/comprar')
    expect(cartIcon()).toHaveAccessibleName('Carrito, 5 productos')
    expect(within(cartIcon()).getByText('5')).toBeInTheDocument()
    unmount()

    seed(Array.from({ length: 11 }, (_, i) => toItem(multiSize, `T${i}`, 10)))
    renderAt('/comprar')
    expect(within(cartIcon()).getByText('99+')).toBeInTheDocument()
  })

  it('al agregar desde el detalle el badge suma 1 y se abre el drawer con ese producto', async () => {
    const { user } = renderAt(`/comprar/${multiSize.id}`)
    await screen.findByRole('heading', { level: 1, name: multiSize.name })

    await user.click(screen.getByRole('button', { name: 'Talla M' }))
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))

    expect(cartIcon()).toHaveAccessibleName('Carrito, 1 producto')
    const drawer = await findDrawer()
    expect(drawer).toHaveAccessibleName('Tu carrito (1)')
    expect(within(drawer).getByText(multiSize.name)).toBeInTheDocument()
    expect(within(drawer).getByText('Talla: M')).toBeInTheDocument()
  })

  it('mismo producto y talla aumenta la cantidad; otra talla crea una línea nueva', async () => {
    const { user } = renderAt(`/comprar/${multiSize.id}`)
    await screen.findByRole('heading', { level: 1, name: multiSize.name })
    const closeDrawer = () => user.click(screen.getByRole('button', { name: 'Cerrar carrito' }))

    await user.click(screen.getByRole('button', { name: 'Talla M' }))
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    await closeDrawer()
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    expect(getRows()).toHaveLength(1)
    expect(within(getRows()[0]).getByRole('status')).toHaveTextContent('2')
    await closeDrawer()

    await user.click(screen.getByRole('button', { name: 'Talla L' }))
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    expect(getRows()).toHaveLength(2)
    expect(cartIcon()).toHaveAccessibleName('Carrito, 3 productos')
  })

  it('sin talla, "Agregar al carrito" muestra "Selecciona una talla" y no agrega nada', async () => {
    const { user } = renderAt(`/comprar/${multiSize.id}`)
    await screen.findByRole('heading', { level: 1, name: multiSize.name })

    const add = screen.getByRole('button', { name: 'Agregar al carrito' })
    await user.click(add)
    expect(screen.getByText('Selecciona una talla')).toBeInTheDocument()
    expect(add).toHaveAccessibleDescription('Selecciona una talla')
    expect(useCartStore.getState().items).toEqual([])
    expect(cartIcon()).toHaveAccessibleName('Carrito vacío')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Talla M' }))
    expect(screen.queryByText('Selecciona una talla')).not.toBeInTheDocument()
  })

  it('en el drawer y en /carrito cada línea muestra foto, nombre, talla, precio, cantidad y subtotal', async () => {
    seed([toItem(onSale, onSale.sizes[0], 2)])
    const check = (container: HTMLElement) => {
      const [row] = within(container).getAllByRole('listitem')
      expect(within(row).getByRole('img', { name: onSale.name })).toHaveAttribute(
        'src',
        onSale.images[0],
      )
      expect(within(row).getByRole('link', { name: onSale.name })).toHaveAttribute(
        'href',
        `/comprar/${onSale.id}`,
      )
      expect(within(row).getByText(onSale.brand)).toBeInTheDocument()
      expect(within(row).getByText(onSale.name)).toBeInTheDocument()
      expect(within(row).getByText(`Talla: ${onSale.sizes[0]}`)).toBeInTheDocument()
      expect(within(row).getByText(`${formatPrice(onSale.price)} c/u`)).toBeInTheDocument()
      expect(row.querySelector('s')).toHaveTextContent(formatPrice(onSale.compareAtPrice ?? 0))
      expect(within(row).getByRole('status')).toHaveTextContent('2')
      expect(within(row).getByText(formatPrice(onSale.price * 2))).toBeInTheDocument()
    }

    const { user, unmount } = renderAt('/comprar')
    await user.click(cartIcon())
    check(await findDrawer())
    unmount()

    useCartStore.setState({ isDrawerOpen: false })
    renderAt('/carrito')
    check(page())
  })

  it('con + y − cambia la cantidad, el subtotal y el total; − se deshabilita en 1 y + en 10', async () => {
    seed([toItem(regular, regular.sizes[0], 1)])
    const { user } = renderAt('/carrito')
    const [row] = getRows()
    const size = regular.sizes[0]
    const minus = within(row).getByRole('button', {
      name: `Disminuir cantidad de ${regular.name}, talla ${size}`,
    })
    const plus = within(row).getByRole('button', {
      name: `Aumentar cantidad de ${regular.name}, talla ${size}`,
    })
    expect(minus).toBeDisabled()
    expect(minus).toHaveClass('min-h-11', 'min-w-11')

    await user.click(plus)
    expect(within(row).getByRole('status')).toHaveTextContent('2')
    expect(within(row).getByText(formatPrice(regular.price * 2))).toBeInTheDocument()
    expect(summaryValue('Total')).toHaveTextContent(formatPrice(regular.price * 2))
    expect(minus).toBeEnabled()

    await user.click(minus)
    expect(within(row).getByRole('status')).toHaveTextContent('1')
    expect(summaryValue('Total')).toHaveTextContent(formatPrice(regular.price))

    for (let i = 1; i < 10; i++) await user.click(plus)
    expect(within(row).getByRole('status')).toHaveTextContent('10')
    expect(plus).toBeDisabled()
  })

  it('al eliminar una línea desaparece y "Deshacer" la devuelve a la misma posición', async () => {
    seed([
      toItem(regular, regular.sizes[0], 1),
      toItem(multiSize, 'M', 1),
      toItem(onSale, onSale.sizes[0], 1),
    ])
    const { user } = renderAt('/carrito')

    await user.click(screen.getByRole('button', { name: `Eliminar ${multiSize.name}, talla M` }))
    expect(getRows()).toHaveLength(2)
    expect(screen.queryByText('Talla: M')).not.toBeInTheDocument()
    expect(screen.getByText('Producto eliminado')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    const rows = getRows()
    expect(rows).toHaveLength(3)
    expect(within(rows[1]).getByText(multiSize.name)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
  })

  it('el total es la suma de precio × cantidad y con ofertas muestra el ahorro', () => {
    seed([toItem(regular, regular.sizes[0], 2), toItem(onSale, onSale.sizes[0], 3)])
    renderAt('/carrito')
    const total = regular.price * 2 + onSale.price * 3
    const savings = ((onSale.compareAtPrice ?? 0) - onSale.price) * 3

    expect(summaryValue('Subtotal')).toHaveTextContent(formatPrice(total))
    expect(summaryValue('Total')).toHaveTextContent(formatPrice(total))
    expect(screen.getByText(`Ahorras ${formatPrice(savings)}`)).toBeInTheDocument()
    expect(screen.getByText('Envío: se calcula en el pago')).toBeInTheDocument()
    expect(screen.getByText('Pago seguro · Cambios y devoluciones en 30 días')).toBeInTheDocument()
  })

  it('sin ofertas no muestra el ahorro', () => {
    seed([toItem(regular, regular.sizes[0], 1)])
    renderAt('/carrito')
    expect(screen.queryByText(/Ahorras/)).not.toBeInTheDocument()
  })

  it('al recargar la página el carrito mantiene sus productos', async () => {
    seed([toItem(regular, regular.sizes[0], 2)])
    const raw = localStorage.getItem(CART_STORAGE_KEY) ?? ''
    useCartStore.setState({ items: [] })
    localStorage.setItem(CART_STORAGE_KEY, raw)
    await useCartStore.persist.rehydrate()

    renderAt('/carrito')
    expect(within(getRows()[0]).getByText(regular.name)).toBeInTheDocument()
    expect(cartIcon()).toHaveAccessibleName('Carrito, 2 productos')
  })

  it('"Comprar carrito" navega a /checkout con los productos del carrito', async () => {
    seed([toItem(regular, regular.sizes[0], 1), toItem(onSale, onSale.sizes[0], 2)])
    const { user } = renderAt('/comprar')
    await user.click(cartIcon())
    await user.click(within(await findDrawer()).getByRole('button', { name: 'Comprar carrito' }))

    expect(location()).toBe('/checkout')
    expect(await screen.findByRole('heading', { level: 1, name: 'Checkout' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const items = within(screen.getByRole('list', { name: 'Productos a comprar' })).getAllByRole(
      'listitem',
    )
    expect(items).toHaveLength(2)
    expect(items[1]).toHaveTextContent(onSale.name)
  })

  it('"Comprar ahora" navega a /checkout con solo ese producto y el carrito no cambia', async () => {
    seed([toItem(regular, regular.sizes[0], 1)])
    const before = useCartStore.getState().items
    const { user } = renderAt(`/comprar/${multiSize.id}`)
    await screen.findByRole('heading', { level: 1, name: multiSize.name })

    await user.click(screen.getByRole('button', { name: 'Comprar ahora' }))
    expect(screen.getByText('Selecciona una talla')).toBeInTheDocument()
    expect(location()).toBe(`/comprar/${multiSize.id}`)

    await user.click(screen.getByRole('button', { name: 'Talla L' }))
    await user.click(screen.getByRole('button', { name: 'Comprar ahora' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Checkout' })).toBeInTheDocument()
    const items = within(screen.getByRole('list', { name: 'Productos a comprar' })).getAllByRole(
      'listitem',
    )
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent(multiSize.name)
    expect(items[0]).toHaveTextContent('Talla L')
    expect(useCartStore.getState().items).toBe(before)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('con el carrito vacío se ve el mensaje y "Ir a comprar" en la página y en el drawer', async () => {
    const { user } = renderAt('/carrito')
    const main = page()
    expect(within(main).getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(within(main).getByRole('link', { name: 'Ir a comprar' })).toHaveAttribute(
      'href',
      '/comprar',
    )

    await user.click(cartIcon())
    const drawer = await findDrawer()
    expect(within(drawer).getByText('Tu carrito está vacío')).toBeInTheDocument()
    await user.click(within(drawer).getByRole('link', { name: 'Ir a comprar' }))
    expect(location()).toBe('/comprar')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('el drawer se cierra con Escape, con el fondo y con el botón cerrar, y el foco vuelve al ícono', async () => {
    const { user } = renderAt(`/comprar/${multiSize.id}`)
    await screen.findByRole('heading', { level: 1, name: multiSize.name })

    // Abierto al agregar desde el detalle: igual devuelve el foco al ícono.
    await user.click(screen.getByRole('button', { name: 'Talla M' }))
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    const drawer = await findDrawer()
    expect(drawer).toHaveAttribute('aria-modal', 'true')
    expect(drawer).toContainElement(document.activeElement as HTMLElement)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(cartIcon()).toHaveFocus()

    await user.click(cartIcon())
    await findDrawer()
    await user.click(screen.getByTestId('cart-backdrop'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(cartIcon()).toHaveFocus()

    await user.click(cartIcon())
    await user.click(within(await findDrawer()).getByRole('button', { name: 'Cerrar carrito' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(cartIcon()).toHaveFocus()
  })

  it('el drawer ocupa todo el ancho en móvil y max-w-md desde sm, con "Ver carrito completo"', async () => {
    seed([toItem(regular, regular.sizes[0], 1)])
    const { user } = renderAt('/comprar')
    await user.click(cartIcon())
    const drawer = await findDrawer()
    expect(drawer).toHaveClass('w-full', 'sm:max-w-md')
    expect(screen.getByRole('list', { name: 'Productos en el carrito' }).parentElement).toHaveClass(
      'overflow-y-auto',
    )

    await user.click(within(drawer).getByRole('link', { name: 'Ver carrito completo' }))
    expect(location()).toBe('/carrito')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // jsdom no aplica media queries: se verifican las clases responsivas.
  it('en /carrito, en móvil el total y el botón van en una barra fija; desde lg el resumen va a la derecha', async () => {
    seed([toItem(regular, regular.sizes[0], 1)])
    const { user } = renderAt('/carrito')

    const buy = screen.getByRole('button', { name: 'Comprar carrito' })
    expect(buy.closest('.fixed')).toHaveClass('bottom-0', 'lg:static')
    expect(page()).toHaveClass('pb-48', 'lg:pb-8')
    expect(page().querySelector('.lg\\:grid-cols-3')).not.toBeNull()
    expect(screen.getByRole('region', { name: 'Resumen de compra' }).parentElement).toHaveClass(
      'lg:sticky',
    )

    await user.click(screen.getByRole('link', { name: 'Seguir comprando' }))
    expect(location()).toBe('/comprar')
  })

  it('no genera scroll horizontal y todo se usa con teclado con foco visible', async () => {
    seed([toItem(onSale, onSale.sizes[0], 2)])
    const { user } = renderAt('/carrito')
    const main = page()
    expect(main.innerHTML).not.toMatch(/\bw-screen\b|\btruncate\b/)
    for (const control of [
      ...within(main).getAllByRole('button'),
      ...within(main).getAllByRole('link'),
    ]) {
      expect(control.className).toMatch(/focus-visible:/)
    }

    await user.click(cartIcon())
    const drawer = await findDrawer()
    for (const control of [
      ...within(drawer).getAllByRole('button'),
      ...within(drawer).getAllByRole('link'),
    ]) {
      expect(control.className).toMatch(/focus-visible:/)
    }
    // El foco queda atrapado en el drawer.
    for (let i = 0; i < 12; i++) {
      await user.tab()
      expect(drawer).toContainElement(document.activeElement as HTMLElement)
    }
  })
})
