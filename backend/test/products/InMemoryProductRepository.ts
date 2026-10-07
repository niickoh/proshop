import type {
  ProductFilterOptions,
  ProductSearchCriteria,
  ProductSearchResult,
} from '../../src/application/product/dtos/ProductSearchCriteria.js';
import type { ProductRepository } from '../../src/application/product/ports/ProductRepository.js';
import type { Product } from '../../src/domain/product/entities/Product.js';

const matchesAny = (selected: string[] | undefined, values: string[]) =>
  !selected?.length || selected.some((value) => values.includes(value));

const byId = (a: Product, b: Product) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const time = (p: Product) => p.props.createdAt.getTime();

export class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly products: Product[] = []) {}

  async search(c: ProductSearchCriteria): Promise<ProductSearchResult> {
    const filtered = this.products.filter(
      ({ props: p, isOnSale }) =>
        matchesAny(c.category, [p.category]) &&
        matchesAny(c.gender, [p.gender]) &&
        matchesAny(c.size, p.sizes) &&
        matchesAny(c.color, p.colors) &&
        matchesAny(c.brand, [p.brand]) &&
        (c.priceMin === undefined || p.price >= c.priceMin) &&
        (c.priceMax === undefined || p.price <= c.priceMax) &&
        (!c.inStockOnly || p.inStock) &&
        (!c.onSale || isOnSale),
    );
    const compare: Record<ProductSearchCriteria['sort'], (a: Product, b: Product) => number> = {
      relevancia: (a, b) =>
        Number(b.props.inStock) - Number(a.props.inStock) || time(b) - time(a) || byId(a, b),
      'precio-asc': (a, b) => a.props.price - b.props.price || byId(a, b),
      'precio-desc': (a, b) => b.props.price - a.props.price || byId(a, b),
      nuevos: (a, b) => time(b) - time(a) || byId(a, b),
    };
    const sorted = [...filtered].sort(compare[c.sort]);
    const start = (c.page - 1) * c.limit;
    return { items: sorted.slice(start, start + c.limit), total: sorted.length };
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) ?? null;
  }

  async getFilterOptions(): Promise<ProductFilterOptions> {
    const all = this.products.map((p) => p.props);
    const prices = all.map((p) => p.price);
    return {
      categories: all.map((p) => p.category),
      genders: all.map((p) => p.gender),
      sizes: all.flatMap((p) => p.sizes),
      colors: all.flatMap((p) => p.colors),
      brands: all.map((p) => p.brand),
      priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
    };
  }
}
