import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation, type InitialEntry } from 'react-router'
import { PRODUCTS } from '../catalogo/data/products'
import { formatPrice, getDiscountPercent } from '../../shared/utils/formatPrice'
import { FROM_CATALOG_STATE } from '../../shared/utils/navigationState'
import ProductoDetallePage from './ProductoDetallePage'
import PurchaseActions from './components/PurchaseActions'
import { getProduct } from './api/getProduct'

vi.mock('./api/getProduct', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/getProduct')>()
  return { ...actual, getProduct: vi.fn(actual.getProduct) }
})
const getProductSpy = vi.mocked(getProduct)

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

function renderAt(entries: InitialEntry[]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const user = userEvent.setup()
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
        <Routes>
          <Route path="/comprar/:id" element={<ProductoDetallePage />} />
          <Route path="/comprar" element={<p>Catálogo</p>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return user
}

const findProduct = (predicate: (p: (typeof PRODUCTS)[number]) => boolean) => {
  const product = PRODUCTS.find(predicate)
  if (!product) throw new Error('Faltan datos de ejemplo')
  return product
}
const withGallery = findProduct((p) => p.images.length > 1 && p.inStock)
const onSale = findProduct((p) => getDiscountPercent(p.price, p.compareAtPrice) > 0)
const soldOut = findProduct((p) => !p.inStock)
const multiSize = findProduct((p) => p.sizes.includes('M') && p.inStock)
const singleSize = findProduct((p) => p.sizes.length === 1)

const location = () => screen.getByTestId('location').textContent
const findTitle = (name: string) => screen.findByRole('heading', { level: 1, name })
const mainPhoto = (name: string) => screen.getByRole('img', { name })

beforeEach(() => {
  getProductSpy.mockClear()
  document.title = 'ProShop'
})

describe('ProductoDetallePage', () => {
  it('muestra la foto principal centrada, marca, nombre, precio y descripción', async () => {
    renderAt([`/comprar/${withGallery.id}`])
    await findTitle(withGallery.name)

    const photo = mainPhoto(withGallery.name)
    expect(photo).toHaveAttribute('src', withGallery.images[0])
    expect(photo).toHaveAttribute('loading', 'eager')
    expect(photo).toHaveClass('object-cover')
    expect(screen.getByText(withGallery.brand)).toBeInTheDocument()
    expect(screen.getByText(formatPrice(withGallery.price))).toBeInTheDocument()
    const description = screen.getByRole('region', { name: 'Descripción' })
    expect(description).toHaveTextContent(withGallery.description.split('\n')[0])
    expect(document.title).toBe(withGallery.name)
  })

  it('al tocar una miniatura cambia la foto principal y queda marcada como activa', async () => {
    const user = renderAt([`/comprar/${withGallery.id}`])
    await findTitle(withGallery.name)

    const thumbs = within(screen.getByRole('list', { name: 'Fotos del producto' })).getAllByRole(
      'button',
    )
    expect(thumbs).toHaveLength(withGallery.images.length)
    expect(thumbs[0]).toHaveAttribute('aria-current', 'true')

    await user.click(thumbs[1])
    expect(mainPhoto(withGallery.name)).toHaveAttribute('src', withGallery.images[1])
    expect(thumbs[1]).toHaveAttribute('aria-current', 'true')
    expect(thumbs[0]).not.toHaveAttribute('aria-current')
  })

  it('un producto en oferta muestra el precio anterior tachado y el badge "% OFF"', async () => {
    renderAt([`/comprar/${onSale.id}`])
    await findTitle(onSale.name)
    const discount = getDiscountPercent(onSale.price, onSale.compareAtPrice)

    const strike = document.querySelector('s')
    expect(strike).toHaveTextContent(formatPrice(onSale.compareAtPrice ?? 0))
    expect(screen.getByText(`${discount}% OFF`)).toBeInTheDocument()
  })

  it('un producto sin stock muestra "Agotado" y los botones de compra deshabilitados', async () => {
    renderAt([`/comprar/${soldOut.id}`])
    await findTitle(soldOut.name)

    expect(screen.getByText('Agotado')).toBeInTheDocument()
    for (const name of ['Agregar al carrito', 'Comprar ahora']) {
      const button = screen.getByRole('button', { name })
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
    }
  })

  it('muestra "Agregar al carrito" y "Comprar ahora" y llama a sus callbacks', async () => {
    renderAt([`/comprar/${withGallery.id}`])
    await findTitle(withGallery.name)
    expect(screen.getByRole('button', { name: 'Agregar al carrito' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Comprar ahora' })).toBeEnabled()

    const onAddToCart = vi.fn()
    const onBuyNow = vi.fn()
    const user = userEvent.setup()
    const { unmount } = render(
      <PurchaseActions disabled={false} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />,
    )
    const actions = screen.getAllByRole('group', { name: 'Acciones de compra' }).at(-1)
    if (!actions) throw new Error('Sin acciones')
    await user.click(within(actions).getByRole('button', { name: 'Agregar al carrito' }))
    await user.click(within(actions).getByRole('button', { name: 'Comprar ahora' }))
    expect(onAddToCart).toHaveBeenCalledTimes(1)
    expect(onBuyNow).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('se puede seleccionar una talla y queda con aria-pressed="true"', async () => {
    const user = renderAt([`/comprar/${multiSize.id}`])
    await findTitle(multiSize.name)

    const size = screen.getByRole('button', { name: 'Talla M' })
    expect(size).toHaveAttribute('aria-pressed', 'false')
    await user.click(size)
    expect(size).toHaveAttribute('aria-pressed', 'true')
  })

  it('con una sola talla, viene seleccionada', async () => {
    renderAt([`/comprar/${singleSize.id}`])
    await findTitle(singleSize.name)
    expect(screen.getByRole('button', { name: `Talla ${singleSize.sizes[0]}` })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('viniendo del catálogo con filtros, "Volver al catálogo" conserva los filtros', async () => {
    const user = renderAt([
      '/comprar?category=poleras&sort=precio-asc',
      { pathname: `/comprar/${withGallery.id}`, state: FROM_CATALOG_STATE },
    ])
    await findTitle(withGallery.name)

    await user.click(screen.getByRole('button', { name: 'Volver al catálogo' }))
    expect(location()).toBe('/comprar?category=poleras&sort=precio-asc')
  })

  it('entrando directo a la URL, "Volver al catálogo" lleva a /comprar', async () => {
    const user = renderAt([`/comprar/${withGallery.id}`])
    await findTitle(withGallery.name)

    await user.click(screen.getByRole('button', { name: 'Volver al catálogo' }))
    expect(location()).toBe('/comprar')
  })

  it('con un id inexistente muestra producto no encontrado y el botón para volver', async () => {
    const user = renderAt(['/comprar/no-existe'])
    expect(
      await screen.findByText('Este producto no existe o ya no está disponible'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Volver al catálogo' }))
    expect(location()).toBe('/comprar')
  })

  it('muestra los estados de carga y de error con "Reintentar"', async () => {
    getProductSpy.mockRejectedValueOnce(new Error('falló'))
    const user = renderAt([`/comprar/${withGallery.id}`])

    expect(screen.getByRole('status', { name: 'Cargando producto' })).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar el producto')

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    await findTitle(withGallery.name)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  // jsdom no aplica media queries: se verifican las clases responsivas.
  it('en móvil los botones van en una barra fija abajo sin tapar la descripción; desde md en el flujo', async () => {
    renderAt([`/comprar/${withGallery.id}`])
    await findTitle(withGallery.name)

    const bar = screen.getByRole('group', { name: 'Acciones de compra' })
    expect(bar).toHaveClass('fixed', 'bottom-0', 'pb-[env(safe-area-inset-bottom)]', 'md:static')
    const page = screen.getByRole('article')
    expect(page).toHaveClass('pb-28', 'md:pb-8')
  })

  it('no genera scroll horizontal y los textos no se cortan', async () => {
    renderAt([`/comprar/${withGallery.id}`])
    await findTitle(withGallery.name)

    const page = screen.getByRole('article')
    expect(page).toHaveClass('mx-auto', 'max-w-3xl')
    expect(screen.getByRole('list', { name: 'Fotos del producto' })).toHaveClass(
      'overflow-x-auto',
      'snap-x',
    )
    expect(page.innerHTML).not.toMatch(/\btruncate\b|\bw-screen\b|line-clamp/)
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('break-words')
  })

  it('se usa con teclado, con foco visible, y la foto principal tiene alt con el nombre', async () => {
    const user = renderAt([`/comprar/${multiSize.id}`])
    await findTitle(multiSize.name)
    expect(mainPhoto(multiSize.name)).toBeInTheDocument()

    const page = screen.getByRole('article')
    const interactive = within(page).getAllByRole('button')
    for (const control of interactive) {
      expect(control.className).toMatch(/focus-visible:/)
    }

    document.body.focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Volver al catálogo' })).toHaveFocus()

    const size = screen.getByRole('button', { name: 'Talla M' })
    size.focus()
    await user.keyboard('{Enter}')
    expect(size).toHaveAttribute('aria-pressed', 'true')
  })
})
