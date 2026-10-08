import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import Header from '../../../../shared/components/Header/Header'
import { apiClient } from '../../../../lib/http'
import { mockApiClient } from '../../../../test/mockApiClient'
import AdminGuard from '../../AdminGuard'
import { NOTICE_DURATION_MS, useAdminNotice } from '../../hooks/useAdminNotice'
import AdminLayout from '../../AdminLayout'
import { SEARCH_DEBOUNCE_MS } from '../hooks/useDebouncedSearch'
import { PRODUCT_CATEGORIES } from '../schema'
import type { AdminProduct } from '../types'
import AdminProductsPage from './AdminProductsPage'

/** Falla el test con un mensaje claro si el valor no existe. */
function must<T>(value: T | null | undefined, what = 'valor'): T {
  if (value === null || value === undefined) throw new Error(`No se encontró: ${what}`)
  return value
}

// --- Backend simulado (adapter de axios, sin red) ---

const makeProduct = (n: number): AdminProduct => ({
  id: `p${String(n).padStart(3, '0')}`,
  name: `${n % 2 ? 'Polera' : 'Chaqueta'} modelo ${n}`,
  brand: n % 3 ? 'Andes Wear' : 'Quillay',
  category: must(PRODUCT_CATEGORIES[n % PRODUCT_CATEGORIES.length]),
  gender: 'unisex',
  description: 'Descripción de prueba con más de veinte caracteres.',
  price: 10_000 + n * 1_000,
  ...(n % 4 === 0 && { compareAtPrice: 20_000 + n * 1_000 }),
  sizes: ['M'],
  colors: ['negro'],
  images: [`/products/p${n}.svg`],
  inStock: n % 5 !== 0,
  active: n % 10 !== 0,
  version: 0,
  createdAt: new Date(Date.UTC(2026, 0, n)).toISOString(),
  updatedAt: new Date(Date.UTC(2026, 0, n)).toISOString(),
})

let catalog: AdminProduct[] = []

function fakeList(url: URL) {
  const p = url.searchParams
  const q = p.get('q')?.toLowerCase()
  const status = p.get('status')
  const page = Number(p.get('page'))
  const limit = Number(p.get('limit'))
  const filtered = catalog.filter(
    (product) =>
      (status === 'all' || product.active === (status === 'active')) &&
      (!p.get('category') || product.category === p.get('category')) &&
      (!q || `${product.name} ${product.brand}`.toLowerCase().includes(q)),
  )
  const sorted = [...filtered].sort((a, b) =>
    p.get('sort') === 'precio-asc'
      ? a.price - b.price
      : p.get('sort') === 'nombre'
        ? a.name.localeCompare(b.name, 'es')
        : Date.parse(b.createdAt) - Date.parse(a.createdAt),
  )
  return {
    items: sorted.slice((page - 1) * limit, page * limit),
    total: sorted.length,
    page,
    totalPages: Math.ceil(sorted.length / limit),
  }
}

let api: ReturnType<typeof mockApiClient>
const listRequests = () =>
  api.handler.mock.calls
    .map((_, n) => api.requestUrl(n))
    .filter((u) => u.pathname.endsWith('/admin/products'))
const lastRequest = () => must(listRequests().at(-1), 'petición al listado')

// --- Render ---

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

function renderAdmin(url = '/admin/productos') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <Header />
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route index element={<Navigate to="productos" replace />} />
            <Route path="productos" element={<AdminProductsPage />} />
          </Route>
          <Route path="*" element={<p>Otra página</p>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { user }
}

const location = () => screen.getByTestId('location').textContent ?? ''
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))
const table = () => screen.getByRole('table', { name: 'Productos' })
const rowNames = () =>
  within(table())
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.querySelector('p')?.textContent)
const setViewport = (width: number) => {
  window.innerWidth = width
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  setViewport(1024)
  catalog = Array.from({ length: 45 }, (_, i) => makeProduct(i + 1))
  useAdminNotice.setState({ notice: null })
  api = mockApiClient()
  vi.stubEnv('VITE_API_URL', 'http://api.test/api')
  api.handler.mockImplementation((config) => {
    const url = new URL(apiClient.getUri(config))
    if (config.method !== 'patch') return { data: fakeList(url) }
    // PATCH /admin/products/:id/status
    const id = url.pathname.split('/').at(-2)
    const index = catalog.findIndex((p) => p.id === id)
    const current = must(catalog[index], `producto ${id}`)
    const { active } = JSON.parse(String(config.data)) as { active: boolean }
    catalog[index] = { ...current, active, version: current.version + 1 }
    return { data: catalog[index] }
  })
})

afterEach(() => {
  api.restore()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

const activeCount = () => catalog.filter((p) => p.active).length

describe('Header', () => {
  it('"Administración" aparece en el header y lleva a /admin/productos', async () => {
    const { user } = renderAdmin('/')
    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    await user.click(
      within(screen.getByRole('navigation', { name: 'Principal' })).getByRole('link', {
        name: 'Administración',
      }),
    )
    expect(location()).toBe('/admin/productos')
    expect(await screen.findByRole('heading', { level: 1, name: 'Productos' })).toBeInTheDocument()
  })
})

describe('Layout del panel', () => {
  it('muestra el menú lateral con Productos activo y las demás opciones como "Próximamente"', async () => {
    renderAdmin()
    const nav = screen.getByRole('navigation', { name: 'Administración' })
    expect(within(nav).getByRole('link', { name: 'Productos' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    for (const name of [
      'Resumen',
      'Ventas',
      'Encargos',
      'Clientes',
      'Inventario',
      'Configuración',
    ]) {
      const item = within(nav).getByRole('link', { name: new RegExp(`^${name}`) })
      expect(item).toHaveAttribute('aria-disabled', 'true')
      expect(item).not.toHaveAttribute('href')
      expect(item).toHaveTextContent('Próximamente')
    }
    await screen.findByRole('table', { name: 'Productos' })
  })

  // jsdom no evalúa Tailwind: se verifican las clases que muestran cada versión.
  it('en móvil el menú es un drawer; desde 1024px es una barra fija a la izquierda', async () => {
    setViewport(360)
    const { user } = renderAdmin()
    const sidebar = screen.getByRole('navigation', { name: 'Administración' }).closest('aside')
    expect(sidebar).toHaveClass('hidden', 'lg:block', 'lg:w-64', 'lg:sticky')

    const toggle = screen.getByRole('button', { name: 'Menú de administración' })
    expect(toggle).toHaveClass('lg:hidden')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    const drawer = screen.getByRole('dialog', { name: 'Menú de administración' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(
      within(drawer).getByRole('button', { name: 'Cerrar menú de administración' }),
    ).toHaveFocus()
    expect(within(drawer).getByRole('link', { name: 'Productos' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(toggle)
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cerrar menú de administración',
      }),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await screen.findByRole('list', { name: 'Productos' })
  })

  it('/admin redirige a /admin/productos', async () => {
    renderAdmin('/admin')
    expect(location()).toBe('/admin/productos')
    await screen.findByRole('table', { name: 'Productos' })
  })
})

describe('Listado', () => {
  it('muestra título, total, botón "Nuevo producto" y por defecto solo activos', async () => {
    renderAdmin()
    expect(await screen.findByText(`${activeCount()} productos`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nuevo producto' })).toHaveAttribute(
      'href',
      '/admin/productos/nuevo',
    )
    expect(lastRequest().searchParams.get('status')).toBe('active')
    expect(within(table()).queryByText('Archivado')).not.toBeInTheDocument()
  })

  it('la tabla muestra miniatura, nombre + marca, categoría, precio y precio anterior, stock, estado y acciones', async () => {
    renderAdmin('/admin/productos?status=all&sort=precio-asc')
    await screen.findByRole('table', { name: 'Productos' })
    const headers = within(table())
      .getAllByRole('columnheader')
      .map((th) => th.textContent)
    expect(headers).toEqual(['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'])

    // p004: con precio anterior; p010: archivado y agotado
    const row = (name: string) => must(within(table()).getByText(name).closest('tr'), name)
    const p4 = within(row('Chaqueta modelo 4'))
    expect(p4.getByText('Andes Wear')).toBeInTheDocument()
    expect(p4.getByText('$14.000')).toBeInTheDocument()
    expect(p4.getByText(/Precio anterior/).closest('s')).toHaveTextContent('$24.000')
    expect(row('Chaqueta modelo 4').querySelector('img')).toHaveAttribute('src', '/products/p4.svg')
    expect(p4.getByRole('link', { name: 'Editar «Chaqueta modelo 4»' })).toHaveAttribute(
      'href',
      '/admin/productos/p004/editar',
    )
    const p10 = within(row('Chaqueta modelo 10'))
    expect(p10.getByText('Archivado')).toBeInTheDocument()
    expect(p10.getByText('Agotado')).toBeInTheDocument()
  })

  it('busca con debounce de 300 ms y la búsqueda queda en la URL', async () => {
    const { user } = renderAdmin()
    await screen.findByRole('table', { name: 'Productos' })
    const requestsBefore = listRequests().length

    await user.type(screen.getByRole('searchbox', { name: 'Buscar' }), 'quillay')
    await advance(SEARCH_DEBOUNCE_MS - 50)
    expect(listRequests()).toHaveLength(requestsBefore)

    await advance(50)
    await waitFor(() => expect(lastRequest().searchParams.get('q')).toBe('quillay'))
    expect(listRequests()).toHaveLength(requestsBefore + 1)
    expect(location()).toBe('/admin/productos?q=quillay')
    await waitFor(() => expect(within(table()).getAllByText('Quillay').length).toBeGreaterThan(0))
    expect(within(table()).queryByText('Andes Wear')).not.toBeInTheDocument()
  })

  it('filtra por categoría y estado, ordena, y los filtros quedan en la URL', async () => {
    const { user } = renderAdmin()
    await screen.findByRole('table', { name: 'Productos' })

    await user.selectOptions(screen.getByRole('combobox', { name: 'Categoría' }), 'calzado')
    await waitFor(() => expect(lastRequest().searchParams.get('category')).toBe('calzado'))
    expect(location()).toBe('/admin/productos?category=calzado')

    await user.selectOptions(screen.getByRole('combobox', { name: 'Estado' }), 'Archivados')
    await waitFor(() => expect(lastRequest().searchParams.get('status')).toBe('archived'))
    expect(location()).toBe('/admin/productos?category=calzado&status=archived')

    await user.selectOptions(screen.getByRole('combobox', { name: 'Ordenar por' }), 'Nombre (A–Z)')
    await waitFor(() => expect(lastRequest().searchParams.get('sort')).toBe('nombre'))
    expect(location()).toContain('sort=nombre')
  })

  it('recargar con filtros en la URL los aplica y los muestra en los controles', async () => {
    renderAdmin('/admin/productos?q=chaqueta&category=poleras&status=all&sort=precio-asc&page=1')
    await screen.findByRole('table', { name: 'Productos' })
    const params = lastRequest().searchParams
    expect(Object.fromEntries(params)).toMatchObject({
      q: 'chaqueta',
      category: 'poleras',
      status: 'all',
      sort: 'precio-asc',
      page: '1',
    })
    expect(screen.getByRole('searchbox', { name: 'Buscar' })).toHaveValue('chaqueta')
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveValue('poleras')
    expect(screen.getByRole('combobox', { name: 'Estado' })).toHaveValue('all')
    expect(screen.getByRole('combobox', { name: 'Ordenar por' })).toHaveValue('precio-asc')
  })

  it('pagina con números y anterior/siguiente; la página queda en la URL', async () => {
    const { user } = renderAdmin('/admin/productos?status=all')
    await screen.findByRole('table', { name: 'Productos' })
    const pagination = screen.getByRole('navigation', { name: 'Paginación' })
    expect(within(pagination).getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(pagination).getByRole('button', { name: 'Anterior' })).toBeDisabled()
    const firstPage = rowNames()

    await user.click(within(pagination).getByRole('button', { name: 'Siguiente' }))
    await waitFor(() => expect(lastRequest().searchParams.get('page')).toBe('2'))
    expect(location()).toBe('/admin/productos?status=all&page=2')
    await waitFor(() => expect(rowNames()).not.toEqual(firstPage))

    await user.click(within(pagination).getByRole('button', { name: 'Página 3' }))
    await waitFor(() => expect(lastRequest().searchParams.get('page')).toBe('3'))
    expect(within(pagination).getByRole('button', { name: 'Siguiente' })).toBeDisabled()

    // Cambiar un filtro vuelve a la página 1
    await user.selectOptions(screen.getByRole('combobox', { name: 'Categoría' }), 'poleras')
    await waitFor(() => expect(lastRequest().searchParams.get('page')).toBe('1'))
    expect(location()).not.toContain('page=')
  })

  it('en móvil el listado se ve como tarjetas y desde 768px como tabla', async () => {
    setViewport(360)
    renderAdmin()
    const cards = await screen.findByRole('list', { name: 'Productos' })
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    const first = must(within(cards).getAllByRole('listitem')[0], 'primera tarjeta')
    expect(within(first).getByRole('heading', { level: 3 })).toBeInTheDocument()
    expect(within(first).getByText('Activo')).toBeInTheDocument()
    expect(within(first).getByRole('link', { name: /^Editar/ })).toBeInTheDocument()
  })

  it('desde 768px se ve la tabla (con su propio scroll horizontal)', async () => {
    setViewport(768)
    renderAdmin()
    const t = await screen.findByRole('table', { name: 'Productos' })
    expect(screen.queryByRole('list', { name: 'Productos' })).not.toBeInTheDocument()
    expect(t.parentElement).toHaveClass('overflow-x-auto')
  })
})

describe('Estados', () => {
  it('muestra un skeleton mientras carga', async () => {
    renderAdmin()
    expect(screen.getByRole('status', { name: 'Cargando productos' })).toBeInTheDocument()
    await screen.findByRole('table', { name: 'Productos' })
    expect(screen.queryByRole('status', { name: 'Cargando productos' })).not.toBeInTheDocument()
  })

  it('error con "Reintentar" que vuelve a pedir', async () => {
    api.handler.mockReturnValueOnce({
      status: 500,
      data: { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
    })
    const { user } = renderAdmin()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No pudimos cargar los productos')

    await user.click(within(alert).getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('table', { name: 'Productos' })).toBeInTheDocument()
  })

  it('vacío: "Aún no hay productos" con "Crear el primero"', async () => {
    catalog = []
    renderAdmin()
    expect(await screen.findByText('Aún no hay productos')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear el primero' })).toHaveAttribute(
      'href',
      '/admin/productos/nuevo',
    )
  })

  it('sin resultados de búsqueda, con "Limpiar filtros"', async () => {
    const { user } = renderAdmin('/admin/productos?q=nada-coincide&sort=nombre')
    const message = must(
      (await screen.findByText('No encontramos productos')).closest<HTMLElement>('[role="status"]'),
      'mensaje sin resultados',
    )
    expect(screen.queryByText('Aún no hay productos')).not.toBeInTheDocument()

    await user.click(within(message).getByRole('button', { name: 'Limpiar filtros' }))
    expect(location()).toBe('/admin/productos?sort=nombre')
    expect(await screen.findByRole('table', { name: 'Productos' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Buscar' })).toHaveValue('')
  })
})

describe('Teclado', () => {
  it('filtros, acciones y paginación se recorren con Tab y tienen foco visible', async () => {
    const { user } = renderAdmin()
    await screen.findByRole('table', { name: 'Productos' })
    screen.getByRole('link', { name: 'Nuevo producto' }).focus()

    const expected = ['Buscar', 'Categoría', 'Estado', 'Ordenar por']
    for (const name of expected) {
      await user.tab()
      expect(document.activeElement).toHaveAccessibleName(name)
    }
    await user.tab()
    expect(document.activeElement).toHaveAccessibleName(/^Editar «/)
    expect(document.activeElement?.className).toMatch(/focus-visible:/)
  })
})

describe('Archivar y reactivar', () => {
  const patches = () =>
    api.handler.mock.calls
      .map(([config]) => config)
      .filter((config) => config.method === 'patch')
      .map((config) => ({ url: new URL(apiClient.getUri(config)).pathname, body: config.data }))

  it('archivar pide confirmación en un diálogo propio y ofrece "Deshacer" por 5 segundos', async () => {
    const { user } = renderAdmin()
    await screen.findByRole('table', { name: 'Productos' })
    const archive = screen.getByRole('button', { name: 'Archivar «Chaqueta modelo 44»' })

    await user.click(archive)
    const dialog = screen.getByRole('alertdialog', { name: '¿Archivar «Chaqueta modelo 44»?' })
    expect(dialog).toHaveTextContent('Dejará de verse en la tienda, pero podrás reactivarlo.')
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(archive).toHaveFocus()
    expect(patches()).toHaveLength(0)

    await user.click(archive)
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Archivar' }),
    )
    expect(await screen.findByText('«Chaqueta modelo 44» archivado')).toBeInTheDocument()
    expect(patches()).toEqual([
      { url: '/api/admin/products/p044/status', body: JSON.stringify({ active: false }) },
    ])
    // Se vuelve a pedir el listado: ya no aparece entre los activos.
    await waitFor(() =>
      expect(within(table()).queryByText('Chaqueta modelo 44')).not.toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(await screen.findByText('Cambio deshecho')).toBeInTheDocument()
    expect(patches().at(-1)?.body).toBe(JSON.stringify({ active: true }))
    expect(await within(table()).findByText('Chaqueta modelo 44')).toBeInTheDocument()

    // El aviso se oculta solo
    await advance(NOTICE_DURATION_MS)
    expect(screen.queryByText('Cambio deshecho')).not.toBeInTheDocument()
  })

  it('reactivar un archivado no pide confirmación y también ofrece "Deshacer"', async () => {
    const { user } = renderAdmin('/admin/productos?status=archived')
    await screen.findByRole('table', { name: 'Productos' })

    await user.click(screen.getByRole('button', { name: 'Reactivar «Chaqueta modelo 40»' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(await screen.findByText('«Chaqueta modelo 40» reactivado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Deshacer' })).toBeInTheDocument()
    expect(patches().at(-1)?.body).toBe(JSON.stringify({ active: true }))
  })
})
