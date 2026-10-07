export type ErrorFields = Record<string, string>;

export class AppError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
    readonly fields?: ErrorFields,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
