import type {
  AdminProductSearchCriteria,
  AdminProductsPage,
} from '../dtos/AdminProductSearchCriteria.js';
import type { ProductRepository } from '../ports/ProductRepository.js';

export class ListAdminProducts {
  constructor(private readonly products: ProductRepository) {}

  async execute(criteria: AdminProductSearchCriteria): Promise<AdminProductsPage> {
    const { items, total } = await this.products.searchAdmin(criteria);
    return {
      items,
      total,
      page: criteria.page,
      totalPages: Math.ceil(total / criteria.limit),
    };
  }
}
