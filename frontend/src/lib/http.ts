import axios from 'axios'
import { ApiError, NotFoundError, type ApiErrorBody } from './errors'

/** `VITE_USE_MOCKS=false` llama al backend; cualquier otro valor (o sin definir) usa `data/`. */
export const isMockMode = () => import.meta.env.VITE_USE_MOCKS !== 'false'

/** Latencia simulada de las funciones de `api/` en modo mock; respeta el `AbortSignal`. */
export function simulateLatency(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => reject(new DOMException('La petición fue cancelada', 'AbortError'))
    if (signal?.aborted) return abort()
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        abort()
      },
      { once: true },
    )
  })
}

/** Cliente HTTP de la API. La URL base se lee en cada petición desde `VITE_API_URL`. */
export const apiClient = axios.create({ timeout: 15_000 })

const isErrorBody = (body: unknown): body is ApiErrorBody =>
  typeof (body as ApiErrorBody | null)?.error?.code === 'string'

/** Convierte un error de axios al formato del proyecto. */
function toApiError(error: unknown): unknown {
  if (axios.isCancel(error)) return new DOMException('La petición fue cancelada', 'AbortError')
  if (!axios.isAxiosError(error) || !error.response) return error

  const { status, data } = error.response
  const body: ApiErrorBody = isErrorBody(data)
    ? data
    : { error: { code: 'HTTP_ERROR', message: `Error ${status}` } }
  if (status === 404) return new NotFoundError(body.error.message, body.error.code)
  return new ApiError(status, body)
}

type GetOptions = { params?: URLSearchParams; signal?: AbortSignal }

/** GET a `VITE_API_URL + path`. Respuestas no exitosas lanzan `ApiError` (`NotFoundError` si es 404). */
export async function apiGet<T>(path: string, { params, signal }: GetOptions = {}): Promise<T> {
  try {
    const response = await apiClient.get<T>(path, {
      baseURL: import.meta.env.VITE_API_URL,
      params,
      signal,
    })
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}
