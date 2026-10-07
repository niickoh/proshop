/** Formato de error del proyecto (400 / 422 / 5xx). */
export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string> }
}

/** Respuesta HTTP no exitosa de la API, con su cuerpo de error. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.error.code
    this.fields = body.error.fields
  }
}

/** Recurso inexistente (HTTP 404). No se reintenta. */
export class NotFoundError extends ApiError {
  constructor(message = 'No encontrado', code = 'NOT_FOUND') {
    super(404, { error: { code, message } })
    this.name = 'NotFoundError'
  }
}
