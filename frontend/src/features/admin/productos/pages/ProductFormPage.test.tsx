import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { InternalAxiosRequestConfig } from 'axios'
import {
  createMemoryRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  useLocation,
} from 'react-router'
import { apiClient } from '../../../../lib/http'
import Header from '../../../../shared/components/Header/Header'
import { mockApiClient } from '../../../../test/mockApiClient'
import CatalogoPage from '../../../catalogo/CatalogoPage'
import { computeFilterOptions } from '../../../catalogo/api/getProductFilters'
import AdminGuard from '../../AdminGuard'
import AdminLayout from '../../AdminLayout'
import { NOTICE_DURATION_MS, useAdminNotice } from '../../hooks/useAdminNotice'
import type { AdminProduct } from '../types'
import AdminProductsPage from './AdminProductsPage'
import ProductFormPage from './ProductFormPage'

// --- Backend simulado (adapter de axios, sin red) ---

const existing = (): AdminProduct => ({
  id: 'polera-existente-a1b2',
  name: 'Polera existente',
  brand: 'Andes Wear',
  category: 'poleras',
  gender: 'unisex',
  description: 'Polera de algodón con más de veinte caracteres.',
  price: 15_990,
  sizes: ['S', 'M'],
  colors: ['negro'],
  images: ['/products/existente.svg'],
  inStock: true,
  active: true,
  version: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

let db: AdminProduct[] = []
type FakeResponse = { status?: number; data: unknown }

const notFound = { status: 404, data: { error: { code: 'NOT_FOUND', message: 'No encontrado' } } }
const bodyOf = (config: InternalAxiosRequestConfig): Record<string, unknown> =>
  typeof config.data === 'string' ? JSON.parse(config.data) : {}

function fakeBackend(config: InternalAxiosRequestConfig): FakeResponse {
  const url = new URL(apiClient.getUri(config))
  const path = url.pathname.replace(/^\/api/, '')
  const method = config.method ?? 'get'
  const visible = db.filter((p) => p.active)

  if (path === '/products') {
    return { data: { items: visible, total: visible.length, page: 1, hasMore: false } }
  }
  if (path === '/products/filters') return { data: computeFilterOptions(visible) }
  if (path === '/admin/products' && method === 'get') {
    const items = url.searchParams.get('status') === 'all' ? db : visible
    return { data: { items, total: items.length, page: 1, totalPages: 1 } }
  }
  if (path === '/admin/products' && method === 'post') {
    const now = new Date().toISOString()
    const body = bodyOf(config)
    const product = { ...body, id: 'nuevo-1234', version: 0, createdAt: now, updatedAt: now }
    db = [product as AdminProduct, ...db]
    return { status: 201, data: product }
  }

  const match = /^\/admin\/products\/([^/]+)(\/status)?$/.exec(path)
  const index = db.findIndex((p) => p.id === decodeURIComponent(match?.[1] ?? ''))
  const current = db[index]
  if (!match || !current) return notFound

  if (method === 'get') return { data: current }
  if (method === 'patch') {
    db[index] = { ...current, active: Boolean(bodyOf(config).active), version: current.version + 1 }
    return { data: db[index] }
  }
  if (method === 'put') {
    const { version, ...body } = bodyOf(config)
    if (version !== current.version) {
      return {
        status: 409,
        data: { error: { code: 'VERSION_CONFLICT', message: 'Otra persona lo modificó' } },
      }
    }
    const { id, createdAt } = current
    db[index] = { ...(body as AdminProduct), id, createdAt, version: current.version + 1 }
    return { data: db[index] }
  }
  return notFound
}

let api: ReturnType<typeof mockApiClient>
const requests = (method: string) =>
  api.handler.mock.calls.map(([config]) => config).filter((config) => config.method === method)
const lastBody = (method: string) => {
  const config = requests(method).at(-1)
  if (!config) throw new Error(`No hubo petición ${method}`)
  return bodyOf(config)
}

// --- Render ---

function Root() {
  const location = useLocation()
  return (
    <>
      <Header />
      <Outlet />
      <div data-testid="location">{location.pathname}</div>
    </>
  )
}

function renderApp(url: string) {
  // Igual que la app: el catálogo no se vuelve a pedir solo durante 60 s.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  })
  const router = createMemoryRouter(
    createRoutesFromElements(
      <Route element={<Root />}>
        <Route path="comprar" element={<CatalogoPage />} />
        <Route
          path="admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to="productos" replace />} />
          <Route path="productos" element={<AdminProductsPage />} />
          <Route path="productos/nuevo" element={<ProductFormPage />} />
          <Route path="productos/:id/editar" element={<ProductFormPage />} />
        </Route>
      </Route>,
    ),
    { initialEntries: [url] },
  )
  const user = userEvent.setup()
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { user }
}

const EDIT_URL = '/admin/productos/polera-existente-a1b2/editar'
const location = () => screen.getByTestId('location').textContent
const field = (name: string) => screen.getByRole('textbox', { name })
const saveButton = () => screen.getByRole('button', { name: /Guardar producto|Guardando…/ })
const headerLink = (name: string) =>
  within(screen.getByRole('navigation', { name: 'Principal' })).getByRole('link', { name })
const waitForForm = () => screen.findByRole('heading', { level: 1, name: /producto$/ })

async function fillNewProduct(user: ReturnType<typeof userEvent.setup>) {
  await user.type(field('Nombre'), 'Polera básica negra')
  await user.type(field('Marca'), 'Quillay')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Categoría' }), 'poleras')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Género' }), 'unisex')
  await user.type(field('Descripción'), 'Polera de algodón orgánico, corte recto.')
  await user.type(field('Precio'), '12990')
  await user.click(screen.getByRole('button', { name: 'M' }))
  await user.type(field('Colores'), 'negro{Enter}')
  await user.type(field('URL de la imagen'), '/products/nueva.svg{Enter}')
}

// jsdom: el data router crea un `Request` de Node con el AbortSignal de jsdom, que Node rechaza.
class JsdomRequest extends Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, { ...init, signal: undefined })
  }
}

beforeAll(() => vi.stubGlobal('Request', JsdomRequest))
afterAll(() => vi.unstubAllGlobals())

beforeEach(() => {
  window.innerWidth = 1280
  db = [existing()]
  useAdminNotice.setState({ notice: null })
  api = mockApiClient()
  api.handler.mockImplementation(fakeBackend)
  vi.stubEnv('VITE_API_URL', 'http://api.test/api')
  vi.stubEnv('VITE_USE_MOCKS', 'false')
})

afterEach(() => {
  api.restore()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('Crear y editar', () => {
  it('crear un producto lo muestra en el listado y en /comprar', async () => {
    const { user } = renderApp('/comprar')
    expect(await screen.findByText('Polera existente')).toBeInTheDocument()

    await user.click(headerLink('Administración'))
    await user.click(await screen.findByRole('link', { name: 'Nuevo producto' }))
    expect(location()).toBe('/admin/productos/nuevo')
    await fillNewProduct(user)

    // La respuesta tarda: el botón muestra "Guardando…" y queda deshabilitado.
    let respond: () => void = () => {}
    api.handler.mockImplementationOnce(
      (config) => new Promise((resolve) => (respond = () => resolve(fakeBackend(config)))),
    )
    await user.click(saveButton())
    expect(saveButton()).toHaveTextContent('Guardando…')
    expect(saveButton()).toBeDisabled()
    act(() => respond())

    expect(await screen.findByText('Producto guardado')).toBeInTheDocument()
    await waitFor(() => expect(location()).toBe('/admin/productos'))
    expect(lastBody('post')).toMatchObject({
      name: 'Polera básica negra',
      price: 12_990,
      sizes: ['M'],
      colors: ['negro'],
      images: ['/products/nueva.svg'],
      inStock: true,
      active: true,
    })
    expect(lastBody('post')).not.toHaveProperty('compareAtPrice')
    const table = await screen.findByRole('table', { name: 'Productos' })
    expect(await within(table).findByText('Polera básica negra')).toBeInTheDocument()

    await user.click(headerLink('Comprar'))
    expect(await screen.findByText('Polera básica negra')).toBeInTheDocument()
  })

  it('editar precio e imágenes se refleja en el catálogo sin recargar la página', async () => {
    const { user } = renderApp('/comprar')
    expect(await screen.findByText('$15.990')).toBeInTheDocument()

    await user.click(headerLink('Administración'))
    await user.click(await screen.findByRole('link', { name: 'Editar «Polera existente»' }))
    await waitForForm()
    expect(field('Nombre')).toHaveValue('Polera existente')

    await user.clear(field('Precio'))
    await user.type(field('Precio'), '13990')
    await user.type(field('Precio anterior'), '19990')
    expect(screen.getByText('Descuento: 30%')).toBeInTheDocument()
    await user.type(field('URL de la imagen'), 'https://cdn.test/portada.jpg{Enter}')
    await user.click(screen.getByRole('button', { name: 'Subir imagen 2' }))
    await user.click(saveButton())

    expect(await screen.findByText('Producto guardado')).toBeInTheDocument()
    expect(lastBody('put')).toMatchObject({
      version: 0,
      price: 13_990,
      compareAtPrice: 19_990,
      images: ['https://cdn.test/portada.jpg', '/products/existente.svg'],
    })

    await user.click(headerLink('Comprar'))
    expect(await screen.findByText('$13.990')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Polera existente' })).toHaveAttribute(
      'src',
      'https://cdn.test/portada.jpg',
    )
  })

  it('los errores de validación aparecen bajo cada campo y el foco va al primero', async () => {
    const { user } = renderApp('/admin/productos/nuevo')
    await waitForForm()

    // Al salir de un campo se valida ese campo.
    await user.type(field('Marca'), 'Q')
    await user.tab()
    expect(field('Marca')).toHaveAccessibleDescription('La marca debe tener al menos 2 caracteres')

    await user.click(saveButton())
    expect(field('Nombre')).toHaveFocus()
    expect(field('Nombre')).toHaveAttribute('aria-invalid', 'true')
    expect(field('Nombre')).toHaveAccessibleDescription(
      'El nombre debe tener al menos 3 caracteres',
    )
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveAccessibleDescription(
      'Elige una categoría',
    )
    expect(field('Precio')).toHaveAccessibleDescription('El precio es obligatorio')
    expect(screen.getByText('Agrega al menos una talla')).toBeInTheDocument()
    expect(screen.getByText('Agrega al menos un color')).toBeInTheDocument()
    expect(screen.getByText('Agrega al menos una imagen')).toBeInTheDocument()
    expect(requests('post')).toHaveLength(0)
  })

  it('un 422 del servidor muestra los errores en sus campos y enfoca el primero', async () => {
    const { user } = renderApp('/admin/productos/nuevo')
    await waitForForm()
    await fillNewProduct(user)
    api.handler.mockReturnValueOnce({
      status: 422,
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Los datos enviados no son válidos',
          fields: { 'images.0': 'La imagen no existe', price: 'Precio fuera de rango' },
        },
      },
    })
    await user.click(saveButton())

    await waitFor(() => expect(field('Precio')).toHaveFocus())
    expect(field('Precio')).toHaveAccessibleDescription('Precio fuera de rango')
    expect(field('URL de la imagen')).toHaveAccessibleDescription(
      'Ruta /products/... o URL https://... La imagen no existe',
    )
    expect(location()).toBe('/admin/productos/nuevo')
  })

  it('un 409 muestra el aviso de conflicto con "Recargar"', async () => {
    const { user } = renderApp(EDIT_URL)
    await waitForForm()
    // Otra persona guarda mientras tanto.
    db[0] = { ...existing(), name: 'Polera editada por otra persona', version: 3 }

    await user.clear(field('Precio'))
    await user.type(field('Precio'), '9990')
    await user.click(saveButton())

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      'Otra persona modificó este producto. Recarga para ver la última versión',
    )
    expect(location()).toBe(EDIT_URL)

    await user.click(within(alert).getByRole('button', { name: 'Recargar' }))
    await waitFor(() => expect(field('Nombre')).toHaveValue('Polera editada por otra persona'))
    expect(field('Precio')).toHaveValue('15990')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.click(saveButton())
    expect(await screen.findByText('Producto guardado')).toBeInTheDocument()
    expect(lastBody('put')).toMatchObject({ version: 3 })
  })

  it('desde lg muestra la vista previa de la tarjeta del catálogo', async () => {
    const { user } = renderApp('/admin/productos/nuevo')
    await waitForForm()
    const preview = screen.getByRole('region', { name: 'Vista previa' })
    expect(preview.closest('aside')).toHaveClass('hidden', 'lg:block')
    expect(within(preview).getByText('Agrega una imagen para ver la vista previa')).toBeVisible()

    await fillNewProduct(user)
    expect(within(preview).getByText('Polera básica negra')).toBeInTheDocument()
    expect(within(preview).getByText('$12.990')).toBeInTheDocument()
  })
})

describe('Cambios sin guardar', () => {
  it('salir con cambios sin guardar muestra el aviso propio', async () => {
    const { user } = renderApp(EDIT_URL)
    await waitForForm()
    await user.type(field('Nombre'), ' oversize')

    // Desde el menú lateral
    const sidebar = screen.getByRole('navigation', { name: 'Administración' })
    await user.click(within(sidebar).getByRole('link', { name: 'Productos' }))
    let dialog = screen.getByRole('alertdialog', { name: 'Tienes cambios sin guardar' })
    expect(within(dialog).getByRole('button', { name: 'Seguir editando' })).toHaveFocus()

    await user.click(within(dialog).getByRole('button', { name: 'Seguir editando' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(location()).toBe(EDIT_URL)
    expect(field('Nombre')).toHaveValue('Polera existente oversize')

    // Desde "Cancelar"; Escape también sigue editando.
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    dialog = screen.getByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Salir sin guardar' }))
    expect(location()).toBe('/admin/productos')
    expect(requests('put')).toHaveLength(0)
  })

  it('sin cambios, "Cancelar" vuelve al listado sin aviso', async () => {
    const { user } = renderApp(EDIT_URL)
    await waitForForm()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(location()).toBe('/admin/productos')
  })
})

describe('Archivar y reactivar desde la edición', () => {
  it('archivar pide confirmación en un diálogo propio y ofrece "Deshacer"', async () => {
    const { user } = renderApp(EDIT_URL)
    await waitForForm()
    const visible = screen.getByRole('switch', { name: 'Visible en la tienda' })
    expect(visible).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('button', { name: 'Archivar' }))
    let dialog = screen.getByRole('alertdialog', { name: '¿Archivar «Polera existente»?' })
    expect(dialog).toHaveAccessibleDescription(
      'Dejará de verse en la tienda, pero podrás reactivarlo.',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(requests('patch')).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: 'Archivar' }))
    dialog = screen.getByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Archivar' }))

    expect(await screen.findByText('«Polera existente» archivado')).toBeInTheDocument()
    expect(lastBody('patch')).toEqual({ active: false })
    expect(screen.getByRole('button', { name: 'Reactivar' })).toBeInTheDocument()
    expect(visible).toHaveAttribute('aria-checked', 'false')

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(await screen.findByText('Cambio deshecho')).toBeInTheDocument()
    expect(lastBody('patch')).toEqual({ active: true })
    expect(visible).toHaveAttribute('aria-checked', 'true')

    // El cambio de estado no deja el formulario "sucio" ni desactualiza la versión.
    await user.click(saveButton())
    expect(await screen.findByText('Producto guardado')).toBeInTheDocument()
    expect(lastBody('put')).toMatchObject({ version: 2, active: true })
  })

  it('el aviso se oculta a los 5 segundos', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { user } = renderApp(EDIT_URL)
    await waitForForm()
    await user.click(screen.getByRole('button', { name: 'Archivar' }))
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Archivar' }),
    )
    expect(await screen.findByRole('button', { name: 'Deshacer' })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(NOTICE_DURATION_MS))
    expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
  })
})

describe('Teclado', () => {
  it('tallas, colores, imágenes e interruptores se usan con teclado', async () => {
    const { user } = renderApp(EDIT_URL)
    await waitForForm()

    // Tallas: chips con Enter/Espacio y talla personalizada con Enter
    const sizeL = screen.getByRole('button', { name: 'L' })
    sizeL.focus()
    await user.keyboard('{Enter}')
    expect(sizeL).toHaveAttribute('aria-pressed', 'true')
    await user.type(field('Talla personalizada'), '46{Enter}')
    expect(screen.getByRole('button', { name: '46' })).toHaveAttribute('aria-pressed', 'true')
    await user.type(field('Talla personalizada'), 'm{Enter}')
    expect(field('Talla personalizada')).toHaveAccessibleDescription('Ya agregaste «m»')

    // Colores: Enter agrega, × quita
    await user.type(field('Colores'), 'azul marino{Enter}')
    const colors = screen.getByRole('list', { name: 'Colores agregados' })
    expect(within(colors).getByText('azul marino')).toBeInTheDocument()
    screen.getByRole('button', { name: 'Quitar color negro' }).focus()
    await user.keyboard('{Enter}')
    expect(within(colors).queryByText('negro')).not.toBeInTheDocument()

    // Imágenes: ↑ ↓ reordenan y el foco sigue a la imagen movida
    await user.type(field('URL de la imagen'), '/products/segunda.svg{Enter}')
    screen.getByRole('button', { name: 'Subir imagen 2' }).focus()
    await user.keyboard('{Enter}')
    const images = screen.getByRole('list', { name: 'Imágenes' })
    const first = within(images).getAllByRole('listitem')[0]
    expect(first).toHaveTextContent('Portada/products/segunda.svg')
    expect(screen.getByRole('button', { name: 'Bajar imagen 1' })).toHaveFocus()
    expect(screen.getByText('Imagen movida a la posición 1 (portada)')).toBeInTheDocument()

    // Interruptores con Espacio
    const inStock = screen.getByRole('switch', { name: 'En stock' })
    inStock.focus()
    await user.keyboard(' ')
    expect(inStock).toHaveAttribute('aria-checked', 'false')

    await user.click(saveButton())
    expect(await screen.findByText('Producto guardado')).toBeInTheDocument()
    expect(lastBody('put')).toMatchObject({
      sizes: ['S', 'M', 'L', '46'],
      colors: ['azul marino'],
      images: ['/products/segunda.svg', '/products/existente.svg'],
      inStock: false,
    })
  })
})

describe('Estados de la edición', () => {
  it('un producto que no existe muestra "No encontramos este producto"', async () => {
    renderApp('/admin/productos/no-existe/editar')
    expect(await screen.findByText('No encontramos este producto')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a productos' })).toHaveAttribute(
      'href',
      '/admin/productos',
    )
  })
})
