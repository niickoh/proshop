import { ApiError } from '../../../lib/errors'
import { mockApiClient } from '../../../test/mockApiClient'
import { PRODUCTS } from '../data/products'
import { computeFilterOptions, getProductFilters } from './getProductFilters'
import { getProducts } from './getProducts'
import { queryProducts } from './queryProducts'

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

describe('modo mock (VITE_USE_MOCKS=true)', () => {
  beforeEach(() => vi.stubEnv('VITE_USE_MOCKS', 'true'))

  it('getProducts usa data/ sin llamar al backend', async () => {
    const filters = { category: ['poleras'] }
    await expect(getProducts({ filters, page: 1, limit: 24 })).resolves.toEqual(
      queryProducts(PRODUCTS, filters, 1, 24),
    )
    expect(api.handler).not.toHaveBeenCalled()
  })

  it('getProductFilters calcula las opciones desde data/, con tallas en orden lógico', async () => {
    const options = await getProductFilters()
    const prices = PRODUCTS.map((p) => p.price)

    expect(api.handler).not.toHaveBeenCalled()
    expect(options.brands).toEqual(
      [...new Set(PRODUCTS.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'es')),
    )
    expect(options.priceRange).toEqual({ min: Math.min(...prices), max: Math.max(...prices) })
    expect(options.sizes.indexOf('XS')).toBeLessThan(options.sizes.indexOf('M'))
  })

  it('getProducts respeta el AbortSignal', async () => {
    const controller = new AbortController()
    const promise = getProducts({ filters: {}, page: 1, limit: 24, signal: controller.signal })
    controller.abort()
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
  })
})

describe('modo backend (VITE_USE_MOCKS=false)', () => {
  beforeEach(() => vi.stubEnv('VITE_USE_MOCKS', 'false'))

  it('getProducts serializa los filtros como listas separadas por comas, sin params vacíos', async () => {
    const page = { items: [], total: 0, page: 2, hasMore: false }
    api.handler.mockReturnValue({ data: page })
    const { signal } = new AbortController()

    const result = await getProducts({
      filters: {
        category: ['poleras', 'chaquetas'],
        gender: [],
        size: ['M'],
        priceMin: 10000,
        inStockOnly: true,
        sort: 'precio-asc',
      },
      page: 2,
      limit: 24,
      signal,
    })

    expect(result).toEqual(page)
    const url = api.requestUrl()
    expect(`${url.origin}${url.pathname}`).toBe(`${API}/products`)
    expect(Object.fromEntries(url.searchParams)).toEqual({
      category: 'chaquetas,poleras',
      size: 'M',
      priceMin: '10000',
      inStockOnly: 'true',
      sort: 'precio-asc',
      page: '2',
      limit: '24',
    })
    expect(api.handler.mock.calls[0]?.[0].signal).toBe(signal)
  })

  it('getProductFilters llama a /products/filters', async () => {
    const options = computeFilterOptions(PRODUCTS)
    api.handler.mockReturnValue({ data: options })

    await expect(getProductFilters()).resolves.toEqual(options)
    expect(api.requestUrl().href).toBe(`${API}/products/filters`)
  })

  it('una respuesta no exitosa lanza ApiError con status, code y fields', async () => {
    api.handler.mockReturnValue({
      status: 400,
      data: { error: { code: 'VALIDATION_ERROR', message: 'inválido', fields: { limit: 'máx 48' } } },
    })

    const error = await getProducts({ filters: {}, page: 1, limit: 100 }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      fields: { limit: 'máx 48' },
    })
  })

  it('una petición cancelada se rechaza como AbortError', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(
      getProducts({ filters: {}, page: 1, limit: 24, signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})
