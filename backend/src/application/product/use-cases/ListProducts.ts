import type { ProductsPage, ProductSearchCriteria } from '../dtos/ProductSearchCriteria.js';
import type { ProductRepository } from '../ports/ProductRepository.js';

export class ListProducts {
  constructor(private readonly products: ProductRepository) {}

  async execute(criteria: ProductSearchCriteria): Promise<ProductsPage> {
    const { items, total } = await this.products.search(criteria);
    const start = (criteria.page - 1) * criteria.limit;
    return {
      items,
      total,
      page: criteria.page,
      hasMore: criteria.limit > 0 && start + criteria.limit < total,
    };
  }
}
