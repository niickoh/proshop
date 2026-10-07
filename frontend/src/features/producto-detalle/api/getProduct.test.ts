import { ApiError, NotFoundError } from '../../../lib/errors'
import { mockApiClient } from '../../../test/mockApiClient'
import { PRODUCTS } from '../../catalogo/data/products'
import { getProduct } from './getProduct'

const API = 'http://api.test/api'

let api: ReturnType<typeof mockApiClient>

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  api = mockApiClient()
  vi.stubEnv('VITE_API_URL', API)
})

afterEach(() => {
  api.restore()
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('getProduct en modo mock', () => {
  beforeEach(() => vi.stubEnv('VITE_USE_MOCKS', 'true'))

  it('devuelve el producto de data/ sin llamar al backend', async () => {
    await expect(getProduct(PRODUCTS[0].id)).resolves.toEqual(PRODUCTS[0])
    expect(api.handler).not.toHaveBeenCalled()
  })

  it('un id inexistente lanza NotFoundError', async () => {
    await expect(getProduct('no-existe')).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('getProduct en modo backend', () => {
  beforeEach(() => vi.stubEnv('VITE_USE_MOCKS', 'false'))

  it('llama a /products/:id pasando el AbortSignal', async () => {
    api.handler.mockReturnValue({ data: PRODUCTS[0] })
    const { signal } = new AbortController()

    await expect(getProduct('p001', signal)).resolves.toEqual(PRODUCTS[0])
    expect(api.requestUrl().href).toBe(`${API}/products/p001`)
    expect(api.handler.mock.calls[0]?.[0].signal).toBe(signal)
  })

  it('un 404 lanza NotFoundError (ApiError con status y code)', async () => {
    api.handler.mockReturnValue({
      status: 404,
      data: { error: { code: 'PRODUCT_NOT_FOUND', message: 'No existe' } },
    })

    const error = await getProduct('no-existe').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(NotFoundError)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, code: 'PRODUCT_NOT_FOUND' })
  })

  it('un 500 lanza ApiError, no NotFoundError', async () => {
    api.handler.mockReturnValue({
      status: 500,
      data: { error: { code: 'INTERNAL_ERROR', message: 'falló' } },
    })

    const error = await getProduct('p001').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).not.toBeInstanceOf(NotFoundError)
    expect(error).toMatchObject({ status: 500, code: 'INTERNAL_ERROR' })
  })
})
