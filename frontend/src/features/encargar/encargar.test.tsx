import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiError } from '../../lib/errors'
import EncargarPage from './EncargarPage'
import { createEncargo } from './api/createEncargo'
import type { EncargoResponse } from './schema'

vi.mock('./api/createEncargo', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/createEncargo')>()
  return { ...actual, createEncargo: vi.fn(actual.createEncargo) }
})
const createEncargoSpy = vi.mocked(createEncargo)

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const RESPONSE: EncargoResponse = {
  id: 'abc',
  folio: 'ENC-000123',
  createdAt: '2026-10-07T12:00:00.000Z',
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const user = userEvent.setup()
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <EncargarPage />
    </QueryClientProvider>,
  )
  return { user, ...utils }
}

const field = (label: string) => screen.getByLabelText(label)
const submitButton = () => screen.getByRole('button', { name: /Enviar encargo|Enviando/ })

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(field('Nombre'), '  Ana ')
  await user.type(field('Apellido'), 'Pérez')
  await user.type(field('Correo'), 'ana@correo.cl')
  await user.type(field('Teléfono'), '9 1234 5678')
  await user.type(field('Dirección'), 'Av. Siempre Viva 742, Santiago')
  await user.type(field('Producto'), 'Zapatillas Nike Air Max')
}

/** Promesa controlable para observar el estado "Enviando…". */
function deferred() {
  let resolve: (value: EncargoResponse) => void = () => {}
  const promise = new Promise<EncargoResponse>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

beforeEach(() => {
  createEncargoSpy.mockClear()
})

describe('EncargarPage', () => {
  it('muestra el formulario centrado con todos los campos y el botón "Enviar encargo"', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Haz tu encargo' })).toBeInTheDocument()
    expect(screen.getByText('* Campos obligatorios')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 }).closest('section')).toHaveClass(
      'mx-auto',
      'max-w-3xl',
    )

    const expected: [string, string][] = [
      ['Nombre', 'given-name'],
      ['Apellido', 'family-name'],
      ['Correo', 'email'],
      ['Teléfono', 'tel'],
      ['Dirección', 'street-address'],
    ]
    for (const [label, autocomplete] of expected) {
      expect(field(label)).toHaveAttribute('autocomplete', autocomplete)
      expect(field(label)).toBeRequired()
    }
    expect(field('Correo')).toHaveAttribute('type', 'email')
    expect(field('Teléfono')).toHaveAttribute('type', 'tel')
    expect(field('Producto')).toHaveAccessibleDescription('Nombre, marca o enlace del producto')
    expect(field('Talla')).toHaveDisplayValue('No aplica')
    expect(field('Talla')).not.toBeRequired()
    expect(
      within(field('Talla'))
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual([
      'No aplica',
      'XS',
      'S',
      'M',
      'L',
      'XL',
      'XXL',
      ...Array.from({ length: 11 }, (_, i) => String(35 + i)),
    ])
    expect(field('Cantidad')).toHaveValue(1)
    expect(field('Cantidad')).toHaveAttribute('inputmode', 'numeric')
    expect(submitButton()).toHaveTextContent('Enviar encargo')
  })

  // jsdom no aplica media queries: se verifican las clases responsivas.
  it('en móvil una columna; desde md dos, con Dirección y Producto a ancho completo', () => {
    renderPage()
    const grid = field('Nombre').closest('.grid')
    expect(grid).toHaveClass('grid', 'md:grid-cols-2', 'gap-x-6', 'gap-y-5')
    expect(grid?.className).not.toMatch(/(^|\s)grid-cols-2/)
    for (const label of ['Dirección', 'Producto']) {
      expect(field(label).closest('.md\\:col-span-2')).not.toBeNull()
    }
    for (const label of ['Nombre', 'Apellido', 'Correo', 'Teléfono', 'Talla', 'Cantidad']) {
      expect(field(label).closest('.md\\:col-span-2')).toBeNull()
    }
    expect(submitButton().closest('.md\\:col-span-2')).not.toBeNull()
    for (const label of ['Nombre', 'Correo', 'Teléfono', 'Talla', 'Cantidad']) {
      expect(field(label)).toHaveClass('min-h-11', 'text-base')
    }
  })

  it('al enviar vacío muestra los errores de los obligatorios y el foco va al primero', async () => {
    const { user } = renderPage()
    await user.click(submitButton())

    expect(field('Nombre')).toHaveFocus()
    const expected: [string, string][] = [
      ['Nombre', 'Ingresa tu nombre'],
      ['Apellido', 'Ingresa tu apellido'],
      ['Correo', 'Ingresa tu correo'],
      ['Teléfono', 'Ingresa tu teléfono'],
      ['Dirección', 'Ingresa tu dirección'],
      ['Producto', 'Ingresa el producto'],
    ]
    for (const [label, message] of expected) {
      expect(field(label)).toHaveAttribute('aria-invalid', 'true')
      expect(field(label)).toHaveAccessibleDescription(expect.stringContaining(message))
    }
    expect(field('Talla')).not.toHaveAttribute('aria-invalid')
    expect(createEncargoSpy).not.toHaveBeenCalled()
  })

  it('un correo o teléfono inválido muestra su mensaje al salir del campo y se revalida al escribir', async () => {
    const { user } = renderPage()
    await user.type(field('Correo'), 'ana@')
    expect(screen.queryByText(/Ingresa un correo válido/)).not.toBeInTheDocument()
    await user.tab()
    expect(field('Correo')).toHaveAccessibleDescription(
      'Ingresa un correo válido, como nombre@correo.cl',
    )

    await user.type(field('Teléfono'), '812345678')
    await user.tab()
    expect(field('Teléfono')).toHaveAccessibleDescription(
      'Ingresa un celular chileno válido, como +56 9 1234 5678',
    )

    await user.type(field('Correo'), 'correo.cl')
    expect(field('Correo')).not.toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText(/Ingresa un correo válido/)).not.toBeInTheDocument()
  })

  it('la cantidad no permite valores fuera de 1 a 20 y − / + respetan los límites', async () => {
    const { user } = renderPage()
    const minus = screen.getByRole('button', { name: 'Disminuir cantidad' })
    const plus = screen.getByRole('button', { name: 'Aumentar cantidad' })
    expect(minus).toBeDisabled()
    expect(minus).toHaveClass('min-h-11', 'min-w-11')

    await user.click(plus)
    expect(field('Cantidad')).toHaveValue(2)
    await user.click(minus)
    expect(field('Cantidad')).toHaveValue(1)

    for (let i = 1; i < 20; i++) await user.click(plus)
    expect(field('Cantidad')).toHaveValue(20)
    expect(plus).toBeDisabled()

    await user.clear(field('Cantidad'))
    await user.type(field('Cantidad'), '25')
    await user.tab()
    expect(field('Cantidad')).toHaveAccessibleDescription(
      'Ingresa una cantidad entera entre 1 y 20',
    )
    await user.click(submitButton())
    expect(createEncargoSpy).not.toHaveBeenCalled()
  })

  it('con datos válidos hace el POST con el cuerpo del contrato, el Idempotency-Key y talla null', async () => {
    createEncargoSpy.mockResolvedValueOnce(RESPONSE)
    const { user } = renderPage()
    await fillValid(user)
    await user.click(submitButton())

    await screen.findByRole('heading', { name: '¡Recibimos tu encargo!' })
    expect(createEncargoSpy).toHaveBeenCalledTimes(1)
    const [body, options] = createEncargoSpy.mock.calls[0]
    expect(body).toEqual({
      nombre: 'Ana',
      apellido: 'Pérez',
      correo: 'ana@correo.cl',
      telefono: '+56912345678',
      direccion: 'Av. Siempre Viva 742, Santiago',
      producto: 'Zapatillas Nike Air Max',
      talla: null,
      cantidad: 1,
    })
    expect(options.idempotencyKey).toMatch(UUID)
  })

  it('envía la talla elegida y la cantidad', async () => {
    createEncargoSpy.mockResolvedValueOnce(RESPONSE)
    const { user } = renderPage()
    await fillValid(user)
    await user.selectOptions(field('Talla'), 'M')
    await user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
    await user.click(submitButton())

    await screen.findByRole('heading', { name: '¡Recibimos tu encargo!' })
    expect(createEncargoSpy.mock.calls[0][0]).toMatchObject({ talla: 'M', cantidad: 2 })
  })

  it('mientras se envía muestra "Enviando…", deshabilita todo y no se envía dos veces', async () => {
    const pending = deferred()
    createEncargoSpy.mockReturnValueOnce(pending.promise)
    const { user } = renderPage()
    await fillValid(user)
    await user.click(submitButton())

    expect(submitButton()).toHaveTextContent('Enviando…')
    expect(submitButton()).toBeDisabled()
    expect(field('Nombre')).toBeDisabled()
    expect(field('Cantidad')).toBeDisabled()
    await user.click(submitButton())
    await user.keyboard('{Enter}')
    expect(createEncargoSpy).toHaveBeenCalledTimes(1)

    pending.resolve(RESPONSE)
    await screen.findByRole('heading', { name: '¡Recibimos tu encargo!' })
  })

  it('con 201 muestra el folio y "Hacer otro encargo" vuelve al formulario vacío con otra key', async () => {
    const { user } = renderPage()
    await fillValid(user)
    await user.click(submitButton())

    // Usa la función real de api/ (latencia simulada de 800 ms).
    const title = await screen.findByRole(
      'heading',
      { name: '¡Recibimos tu encargo!' },
      { timeout: 3000 },
    )
    expect(title).toHaveFocus()
    expect(screen.getByText(/^ENC-\d{6}$/)).toBeInTheDocument()
    expect(
      screen.getByText('Te contactaremos a ana@correo.cl en un plazo de 48 horas hábiles'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Enviar encargo' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Hacer otro encargo' }))
    expect(field('Nombre')).toHaveValue('')
    expect(field('Producto')).toHaveValue('')
    expect(field('Cantidad')).toHaveValue(1)
    expect(field('Nombre')).not.toHaveAttribute('aria-invalid', 'true')

    createEncargoSpy.mockResolvedValueOnce(RESPONSE)
    await fillValid(user)
    await user.click(submitButton())
    await screen.findByRole('heading', { name: '¡Recibimos tu encargo!' })
    const [first, second] = createEncargoSpy.mock.calls.map(([, options]) => options.idempotencyKey)
    expect(second).toMatch(UUID)
    expect(second).not.toBe(first)
  })

  it('con 422 el error del servidor aparece en el campo correspondiente', async () => {
    createEncargoSpy.mockRejectedValueOnce(
      new ApiError(422, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos inválidos',
          fields: { correo: 'Este correo no puede recibir encargos' },
        },
      }),
    )
    const { user } = renderPage()
    await fillValid(user)
    await user.click(submitButton())

    expect(await screen.findByText('Este correo no puede recibir encargos')).toBeInTheDocument()
    expect(field('Correo')).toHaveAttribute('aria-invalid', 'true')
    expect(field('Correo')).toHaveAccessibleDescription('Este correo no puede recibir encargos')
    expect(field('Correo')).toHaveFocus()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it.each([
    ['500', new ApiError(500, { error: { code: 'INTERNAL', message: 'Error interno' } })],
    ['de red', new TypeError('Failed to fetch')],
  ])('con error %s aparece el aviso y los datos siguen en el formulario', async (_, error) => {
    createEncargoSpy.mockRejectedValueOnce(error)
    const { user } = renderPage()
    await fillValid(user)
    await user.click(submitButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos enviar tu encargo. Revisa tu conexión e inténtalo de nuevo',
    )
    expect(field('Nombre')).toHaveValue('  Ana ')
    expect(field('Producto')).toHaveValue('Zapatillas Nike Air Max')
    expect(submitButton()).toBeEnabled()
    expect(submitButton()).toHaveTextContent('Enviar encargo')
  })

  it('si el honeypot está lleno no hace la petición', async () => {
    const { user, container } = renderPage()
    const honeypot = container.querySelector<HTMLInputElement>('input[name="website"]')
    if (!honeypot) throw new Error('Falta el honeypot')
    expect(honeypot).toHaveAttribute('tabindex', '-1')
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull()

    await fillValid(user)
    await user.type(honeypot, 'https://spam.example')
    await user.click(submitButton())
    expect(createEncargoSpy).not.toHaveBeenCalled()
  })

  it('se usa con teclado, cada campo tiene label visible y los errores se anuncian', async () => {
    const { user } = renderPage()
    document.body.focus()
    const order = ['Nombre', 'Apellido', 'Correo', 'Teléfono', 'Dirección', 'Producto', 'Talla']
    for (const label of order) {
      await user.tab()
      expect(field(label)).toHaveFocus()
      expect(field(label).className).toMatch(/focus-visible:|focus:/)
      expect(screen.getByText(label, { selector: 'label, label *' })).toBeVisible()
    }
    await user.tab()
    expect(screen.getByRole('button', { name: 'Disminuir cantidad' })).toBeDisabled()
    expect(field('Cantidad')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Aumentar cantidad' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(field('Cantidad')).toHaveValue(2)
    await user.tab()
    expect(submitButton()).toHaveFocus()

    // Enter en un campo envía; los errores quedan en una región aria-live ligada al campo.
    field('Nombre').focus()
    await user.keyboard('{Enter}')
    const description = field('Nombre').getAttribute('aria-describedby') ?? ''
    const error = document.getElementById(description.split(' ').at(-1) ?? '')
    expect(error).toHaveTextContent('Ingresa tu nombre')
    expect(error?.closest('[aria-live="polite"]')).not.toBeNull()
  })

  it('no genera scroll horizontal', () => {
    const { container } = renderPage()
    expect(container.innerHTML).not.toMatch(/\bw-screen\b|\btruncate\b/)
    expect(container.querySelector('fieldset')).toHaveClass('min-w-0')
    for (const label of ['Nombre', 'Dirección', 'Producto', 'Talla']) {
      expect(field(label)).toHaveClass('w-full')
    }
  })
})
