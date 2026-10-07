import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import CatalogoPage from './CatalogoPage'
import { getProducts, type GetProductsParams } from './api/getProducts'
import { queryProducts } from './api/queryProducts'
import { PRODUCTS } from './data/products'
import type { ProductFilters } from './types'

vi.mock('./api/getProducts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/getProducts')>()
  return { ...actual, getProducts: vi.fn(actual.getProducts) }
})

const getProductsSpy = vi.mocked(getProducts)
/** Peticiones de productos (excluye las de solo conteo, limit = 0). */
const productCalls = () =>
  getProductsSpy.mock.calls.map(([params]) => params).filter((p: GetProductsParams) => p.limit > 0)
const countCalls = () =>
  getProductsSpy.mock.calls
    .map(([params]) => params)
    .filter((p: GetProductsParams) => p.limit === 0)
const totalFor = (filters: ProductFilters) => queryProducts(PRODUCTS, filters, 1, 0).total

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

function renderPage(url = '/comprar') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/comprar" element={<CatalogoPage />} />
          <Route path="*" element={<p>Otra página</p>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { user, ...utils }
}

const setViewport = (width: number) => {
  window.innerWidth = width
}
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))
const location = () => screen.getByTestId('location').textContent ?? ''
const grid = () => screen.getByRole('list', { name: 'Productos' })
const cardNames = () =>
  within(grid())
    .getAllByRole('heading', { level: 3 })
    .map((h) => h.textContent)
const waitForResults = (total: number) => screen.findByText(`${total} resultados`)

// IntersectionObserver controlable para el scroll infinito.
let intersect: () => void = () => {}
class FakeIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersect = () =>
      act(() =>
        callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        ),
      )
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  getProductsSpy.mockClear()
  setViewport(1280)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('CatalogoPage', () => {
  it('muestra la grilla con los productos y el total de resultados', async () => {
    renderPage()
    await waitForResults(PRODUCTS.length)
    expect(within(grid()).getAllByRole('listitem')).toHaveLength(24)
    expect(screen.getByRole('heading', { level: 1, name: 'Comprar' })).toBeInTheDocument()
  })

  it('en escritorio, 3 filtros seguidos hacen una sola petición 400 ms después del último', async () => {
    const { user } = renderPage()
    await waitForResults(PRODUCTS.length)
    getProductsSpy.mockClear()

    const panel = screen.getByRole('complementary', { name: 'Filtros' })
    await user.click(within(panel).getByRole('checkbox', { name: 'Poleras' }))
    await user.click(within(panel).getByRole('checkbox', { name: 'Pantalones' }))
    await user.click(within(panel).getByRole('button', { name: 'Talla M' }))

    advance(350)
    expect(productCalls()).toHaveLength(0)

    advance(100)
    await waitFor(() => expect(productCalls()).toHaveLength(1))
    expect(productCalls()[0].filters).toMatchObject({
      category: ['pantalones', 'poleras'],
      size: ['M'],
    })

    advance(1000)
    expect(productCalls()).toHaveLength(1)
  })

  it('en móvil, el drawer no pide productos hasta tocar "Ver N resultados"', async () => {
    setViewport(360)
    const { user } = renderPage()
    await waitForResults(PRODUCTS.length)
    getProductsSpy.mockClear()

    await user.click(screen.getByRole('button', { name: /^Filtros/ }))
    const drawer = screen.getByRole('dialog', { name: 'Filtros' })
    await user.click(within(drawer).getByRole('checkbox', { name: 'Poleras' }))
    await user.click(within(drawer).getByRole('checkbox', { name: 'En oferta' }))
    advance(1000)

    const expected = totalFor({ category: ['poleras'], onSale: true })
    const apply = await within(drawer).findByRole('button', {
      name: `Ver ${expected} resultados`,
    })
    expect(productCalls()).toHaveLength(0)
    expect(countCalls().length).toBeGreaterThan(0)
    expect(location()).toBe('/comprar')

    await user.click(apply)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitForResults(expected)
    expect(productCalls()).toHaveLength(1)
    expect(location()).toBe('/comprar?category=poleras&onSale=1')
  })

  it('cerrar el drawer sin aplicar descarta los cambios', async () => {
    setViewport(360)
    const { user } = renderPage()
    await waitForResults(PRODUCTS.length)
    getProductsSpy.mockClear()

    const openDrawer = async () => {
      await user.click(screen.getByRole('button', { name: /^Filtros/ }))
      return screen.getByRole('dialog', { name: 'Filtros' })
    }

    let drawer = await openDrawer()
    await user.click(within(drawer).getByRole('checkbox', { name: 'Poleras' }))
    await user.click(within(drawer).getByRole('button', { name: 'Cerrar filtros' }))

    drawer = await openDrawer()
    expect(within(drawer).getByRole('checkbox', { name: 'Poleras' })).not.toBeChecked()
    await user.click(within(drawer).getByRole('checkbox', { name: 'Vestidos' }))
    await user.keyboard('{Escape}')

    drawer = await openDrawer()
    expect(within(drawer).getByRole('checkbox', { name: 'Vestidos' })).not.toBeChecked()

    expect(location()).toBe('/comprar')
    expect(productCalls()).toHaveLength(0)
  })

  it('los filtros aplicados quedan en la URL y se restauran desde un enlace', async () => {
    const { user, unmount } = renderPage()
    await waitForResults(PRODUCTS.length)

    await user.click(screen.getByRole('checkbox', { name: 'Calzado' }))
    advance(400)
    await waitFor(() => expect(location()).toBe('/comprar?category=calzado'))
    const sharedUrl = location()
    unmount()

    renderPage(sharedUrl)
    await waitForResults(totalFor({ category: ['calzado'] }))
    expect(screen.getByRole('checkbox', { name: 'Calzado' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Quitar filtro: Calzado' })).toBeInTheDocument()
  })

  it('cada filtro activo es un chip removible y "Limpiar todo" los quita todos', async () => {
    const { user } = renderPage('/comprar?category=poleras&gender=mujer&onSale=1')
    await waitForResults(totalFor({ category: ['poleras'], gender: ['mujer'], onSale: true }))

    const chips = screen.getByRole('list', { name: 'Filtros activos' })
    expect(within(chips).getAllByRole('button', { name: /^Quitar filtro/ })).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: 'Quitar filtro: Poleras' }))
    await waitForResults(totalFor({ gender: ['mujer'], onSale: true }))
    expect(location()).toBe('/comprar?gender=mujer&onSale=1')

    await user.click(screen.getByRole('button', { name: 'Limpiar todo' }))
    await waitForResults(PRODUCTS.length)
    expect(screen.queryByRole('list', { name: 'Filtros activos' })).not.toBeInTheDocument()
    expect(location()).toBe('/comprar')
  })

  it('si el precio mínimo es mayor que el máximo muestra un error y no se aplica', async () => {
    const { user } = renderPage()
    await waitForResults(PRODUCTS.length)
    getProductsSpy.mockClear()

    await user.type(screen.getByRole('spinbutton', { name: 'Precio mínimo' }), '50000')
    await user.type(screen.getByRole('spinbutton', { name: 'Precio máximo' }), '10000')
    advance(1000)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'El precio mínimo no puede ser mayor que el máximo',
    )
    expect(productCalls()).toHaveLength(0)
    expect(location()).toBe('/comprar')
  })

  it('ordena por precio ascendente y descendente', async () => {
    const { user } = renderPage()
    await waitForResults(PRODUCTS.length)
    const priceOf = (name: string | null) => PRODUCTS.find((p) => p.name === name)?.price ?? NaN
    const select = screen.getByRole('combobox', { name: 'Ordenar por' })

    await user.selectOptions(select, 'precio-asc')
    await waitFor(() => expect(location()).toBe('/comprar?sort=precio-asc'))
    await waitFor(() => expect(grid()).toHaveAttribute('aria-busy', 'false'))
    const asc = cardNames().map(priceOf)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    expect(asc[0]).toBe(Math.min(...PRODUCTS.map((p) => p.price)))

    await user.selectOptions(select, 'precio-desc')
    await waitFor(() => expect(location()).toBe('/comprar?sort=precio-desc'))
    await waitFor(() => expect(grid()).toHaveAttribute('aria-busy', 'false'))
    const desc = cardNames().map(priceOf)
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
    expect(desc[0]).toBe(Math.max(...PRODUCTS.map((p) => p.price)))
  })

  it('al llegar al final carga más productos y al terminar muestra el mensaje de fin', async () => {
    renderPage()
    await waitForResults(PRODUCTS.length)
    expect(within(grid()).getAllByRole('listitem')).toHaveLength(24)

    intersect()
    await waitFor(() => expect(within(grid()).getAllByRole('listitem')).toHaveLength(48))
    expect(screen.getByRole('button', { name: 'Cargar más' })).toBeInTheDocument()

    intersect()
    await waitFor(() =>
      expect(within(grid()).getAllByRole('listitem')).toHaveLength(PRODUCTS.length),
    )
    expect(screen.getByText(`Viste los ${PRODUCTS.length} productos`)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cargar más' })).not.toBeInTheDocument()
  })

  it('mientras cargan nuevos filtros los resultados anteriores siguen visibles', async () => {
    const { user } = renderPage()
    await waitForResults(PRODUCTS.length)
    const before = cardNames()

    await user.click(screen.getByRole('checkbox', { name: 'Accesorios' }))
    advance(400)
    await waitFor(() => expect(grid()).toHaveAttribute('aria-busy', 'true'))
    expect(cardNames()).toEqual(before)
    expect(screen.queryByRole('list', { name: 'Cargando productos' })).not.toBeInTheDocument()

    await waitForResults(totalFor({ category: ['accesorios'] }))
    expect(grid()).toHaveAttribute('aria-busy', 'false')
  })

  it('muestra los estados de carga, error con "Reintentar" y sin resultados', async () => {
    getProductsSpy.mockRejectedValueOnce(new Error('falló'))
    const { user, unmount } = renderPage()

    const skeletons = screen.getByRole('list', { name: 'Cargando productos' })
    expect(within(skeletons).getAllByRole('listitem')).toHaveLength(8)

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar los productos')
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitForResults(PRODUCTS.length)
    unmount()

    const empty = renderPage('/comprar?category=vestidos&gender=hombre')
    expect(
      await screen.findByText('No encontramos productos con estos filtros'),
    ).toBeInTheDocument()
    await empty.user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    await waitForResults(PRODUCTS.length)
  })

  it('una tarjeta en oferta muestra el precio anterior tachado y una sin stock "Agotado"', async () => {
    renderPage()
    await waitForResults(PRODUCTS.length)
    const firstPage = PRODUCTS.slice(0, 24)
    const onSale = firstPage.find((p) => p.compareAtPrice !== undefined)
    const soldOut = firstPage.find((p) => !p.inStock)
    if (!onSale?.compareAtPrice || !soldOut) throw new Error('Faltan datos de ejemplo')

    const saleCard = screen.getByRole('link', { name: new RegExp(onSale.name) })
    const fmt = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
    const strike = saleCard.querySelector('s')
    expect(strike).toHaveTextContent(fmt.format(onSale.compareAtPrice))
    expect(within(saleCard).getByText(/% OFF$/)).toBeInTheDocument()

    const soldOutCard = screen.getByRole('link', { name: new RegExp(soldOut.name) })
    expect(within(soldOutCard).getByText('Agotado')).toBeInTheDocument()
    expect(soldOutCard).toHaveAttribute('href', `/comprar/${soldOut.id}`)
  })

  // jsdom no aplica media queries: se verifican las clases responsivas de la grilla.
  it('usa 2 columnas en móvil, 3 en md/lg y 4 en xl, sin scroll horizontal', async () => {
    renderPage()
    await waitForResults(PRODUCTS.length)
    expect(grid()).toHaveClass('grid-cols-2', 'md:grid-cols-3', 'xl:grid-cols-4')
    expect(grid().className).not.toMatch(/overflow-x/)
  })

  it('el panel y el drawer se usan con teclado y cada control tiene nombre accesible', async () => {
    const { user, unmount } = renderPage()
    await waitForResults(PRODUCTS.length)

    const panel = screen.getByRole('complementary', { name: 'Filtros' })
    for (const control of [
      ...within(panel).getAllByRole('checkbox'),
      ...within(panel).getAllByRole('button'),
      ...within(panel).getAllByRole('spinbutton'),
    ]) {
      expect(control).toHaveAccessibleName()
    }
    const categoria = within(panel).getByRole('button', { name: /^Categoría/ })
    expect(categoria).toHaveAttribute('aria-expanded', 'true')
    categoria.focus()
    await user.keyboard('{Enter}')
    expect(categoria).toHaveAttribute('aria-expanded', 'false')
    unmount()

    setViewport(360)
    const mobile = renderPage()
    await waitForResults(PRODUCTS.length)
    const trigger = screen.getByRole('button', { name: /^Filtros/ })
    trigger.focus()
    await mobile.user.keyboard('{Enter}')
    const drawer = screen.getByRole('dialog', { name: 'Filtros' })
    expect(drawer).toHaveAttribute('aria-modal', 'true')
    expect(drawer).toContainElement(document.activeElement as HTMLElement)

    // El foco queda atrapado: Shift+Tab desde el primer elemento va al último.
    await mobile.user.tab({ shift: true })
    expect(drawer).toContainElement(document.activeElement as HTMLElement)
    await mobile.user.tab()
    expect(drawer).toContainElement(document.activeElement as HTMLElement)

    await mobile.user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
