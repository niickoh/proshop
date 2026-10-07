import type { EncargoRequest, EncargoResponse } from '../schema'

export const SIMULATED_LATENCY_MS = 800

type Options = {
  /** UUID generado al montar el formulario: un doble envío no crea dos encargos. */
  idempotencyKey: string
  signal?: AbortSignal
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
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

let lastFolio = 122

/**
 * `POST ${VITE_API_URL}/api/encargos`. Sin backend todavía: responde un 201 de ejemplo.
 * Para conectarlo, reemplazar el cuerpo por:
 * ```ts
 * const response = await fetch(`${import.meta.env.VITE_API_URL}/api/encargos`, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
 *   body: JSON.stringify(body),
 *   signal,
 * })
 * if (!response.ok) throw new ApiError(response.status, await response.json())
 * return response.json()
 * ```
 */
export async function createEncargo(
  body: EncargoRequest,
  { idempotencyKey, signal }: Options,
): Promise<EncargoResponse> {
  void body // Se enviará en el `fetch` real.
  await wait(SIMULATED_LATENCY_MS, signal)
  lastFolio += 1
  return {
    id: idempotencyKey,
    folio: `ENC-${String(lastFolio).padStart(6, '0')}`,
    createdAt: new Date().toISOString(),
  }
}
