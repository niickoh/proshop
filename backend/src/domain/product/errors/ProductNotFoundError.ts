import { AppError } from '../../../shared/errors/AppError.js';

export class ProductNotFoundError extends AppError {
  constructor(id: string) {
    super('PRODUCT_NOT_FOUND', 404, `Producto ${id} no encontrado`);
    this.name = 'ProductNotFoundError';
  }
}
