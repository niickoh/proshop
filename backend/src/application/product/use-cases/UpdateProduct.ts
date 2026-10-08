import { Product, type ProductData } from '../../../domain/product/entities/Product.js';
import { ProductNotFoundError } from '../../../domain/product/errors/ProductNotFoundError.js';
import { VersionConflictError } from '../../../domain/product/errors/VersionConflictError.js';
import type { ProductRepository } from '../ports/ProductRepository.js';

export type UpdateProductInput = ProductData & { version: number };

export class UpdateProduct {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string, { version, ...data }: UpdateProductInput): Promise<Product> {
    const current = await this.products.findById(id);
    if (!current) throw new ProductNotFoundError(id);
    if (current.props.version !== version) throw new VersionConflictError(id);

    // Valida las reglas de la entidad antes de escribir
    Product.create({ ...current.props, ...data, compareAtPrice: data.compareAtPrice });

    const updated = await this.products.update(id, data, version);
    // Otra edición se guardó entre la lectura y la escritura
    if (!updated) throw new VersionConflictError(id);
    return updated;
  }
}
