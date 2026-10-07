import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { apiClient } from '../lib/http'

type FakeResponse = { status?: number; data: unknown }

/**
 * Reemplaza el adapter de `apiClient` (sin red). `handler` recibe la config de cada petición
 * y devuelve `{ status, data }`; un status >= 400 se rechaza como lo haría axios.
 */
export function mockApiClient() {
  const handler = vi.fn<(config: InternalAxiosRequestConfig) => FakeResponse>()
  const original = apiClient.defaults.adapter

  apiClient.defaults.adapter = async (config) => {
    const { status = 200, data } = handler(config)
    const response: AxiosResponse = { data, status, statusText: '', headers: {}, config }
    if (status >= 400) {
      throw new AxiosError(`Error ${status}`, AxiosError.ERR_BAD_RESPONSE, config, null, response)
    }
    return response
  }

  /** URL completa de la llamada `n`, con sus query params. */
  const requestUrl = (n = 0) => {
    const config = handler.mock.calls[n]?.[0]
    if (!config) throw new Error(`No hubo petición #${n}`)
    return new URL(apiClient.getUri(config))
  }

  return {
    handler,
    requestUrl,
    restore: () => {
      apiClient.defaults.adapter = original
    },
  }
}
