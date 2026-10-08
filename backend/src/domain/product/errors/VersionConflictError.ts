import { AppError } from '../../../shared/errors/AppError.js';

export class VersionConflictError extends AppError {
  constructor(id: string) {
    super(
      'VERSION_CONFLICT',
      409,
      `El producto ${id} fue modificado por otra persona. Recarga para ver la última versión`,
    );
    this.name = 'VersionConflictError';
  }
}
