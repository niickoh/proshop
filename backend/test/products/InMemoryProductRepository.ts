import type { AdminProductSearchCriteria } from '../../src/application/product/dtos/AdminProductSearchCriteria.js';
import type {
  ProductFilterOptions,
  ProductSearchCriteria,
  ProductSearchResult,
} from '../../src/application/product/dtos/ProductSearchCriteria.js';
import type { ProductRepository } from '../../src/application/product/ports/ProductRepository.js';
import { Product, type ProductData } from '../../src/domain/product/entities/Product.js';

const matchesAny = (selected: string[] | undefined, values: string[]) =>
  !selected?.length || selected.some((value) => values.includes(value));

const byId = (a: Product, b: Product) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const time = (p: Product) => p.props.createdAt.getTime();

export class InMemoryProductRepository implements ProductRepository {
  private products: Product[];

  constructor(products: Product[] = []) {
    this.products = [...products];
  }

  async search(c: ProductSearchCriteria): Promise<ProductSearchResult> {
    const filtered = this.products.filter(
      ({ props: p, isOnSale, isActive }) =>
        isActive &&
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
    const all = this.products.filter((p) => p.isActive).map((p) => p.props);
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

  async searchAdmin(c: AdminProductSearchCriteria): Promise<ProductSearchResult> {
    const q = c.q?.toLowerCase();
    const filtered = this.products.filter(
      ({ props: p, isActive }) =>
        (c.status === 'all' || isActive === (c.status === 'active')) &&
        (!c.category || p.category === c.category) &&
        (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)),
    );
    const compare: Record<AdminProductSearchCriteria['sort'], (a: Product, b: Product) => number> =
      {
        nuevos: (a, b) => time(b) - time(a) || byId(a, b),
        nombre: (a, b) =>
          a.props.name.localeCompare(b.props.name, 'es', { sensitivity: 'base' }) || byId(a, b),
        'precio-asc': (a, b) => a.props.price - b.props.price || byId(a, b),
        'precio-desc': (a, b) => b.props.price - a.props.price || byId(a, b),
      };
    const sorted = [...filtered].sort(compare[c.sort]);
    const start = (c.page - 1) * c.limit;
    return { items: sorted.slice(start, start + c.limit), total: sorted.length };
  }

  async create(product: Product): Promise<Product> {
    this.products.push(product);
    return product;
  }

  async update(id: string, data: ProductData, expectedVersion: number): Promise<Product | null> {
    const current = await this.findById(id);
    if (!current || current.props.version !== expectedVersion) return null;
    const { compareAtPrice: _removed, ...rest } = current.props;
    return this.replace(
      Product.create({ ...rest, ...data, version: expectedVersion + 1, updatedAt: new Date() }),
    );
  }

  async setActive(id: string, active: boolean): Promise<Product | null> {
    const current = await this.findById(id);
    if (!current) return null;
    const { version } = current.props;
    return this.replace(
      Product.create({ ...current.props, active, version: version + 1, updatedAt: new Date() }),
    );
  }

  private replace(product: Product): Product {
    this.products = this.products.map((p) => (p.id === product.id ? product : p));
    return product;
  }
}
