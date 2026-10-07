import { describe, expect, it } from 'vitest';
import type { ProductSearchCriteria } from '../../src/application/product/dtos/ProductSearchCriteria.js';
import { GetProductById } from '../../src/application/product/use-cases/GetProductById.js';
import {
  compareSizes,
  GetProductFilters,
} from '../../src/application/product/use-cases/GetProductFilters.js';
import { ListProducts } from '../../src/application/product/use-cases/ListProducts.js';
import { Product, type ProductProps } from '../../src/domain/product/entities/Product.js';
import { ProductNotFoundError } from '../../src/domain/product/errors/ProductNotFoundError.js';
import { seedProducts } from './fixtures.js';
import { InMemoryProductRepository } from './InMemoryProductRepository.js';

const products = seedProducts();
const repo = new InMemoryProductRepository(products);
const criteria = (patch: Partial<ProductSearchCriteria> = {}): ProductSearchCriteria => ({
  sort: 'relevancia',
  page: 1,
  limit: 24,
  ...patch,
});

describe('Product (dominio)', () => {
  const base: ProductProps = {
    id: 'x1',
    name: 'Polera',
    brand: 'Marca',
    category: 'poleras',
    gender: 'mujer',
    price: 1000,
    sizes: ['M'],
    colors: ['negro'],
    images: ['/products/x.svg'],
    inStock: true,
    description: 'desc',
    createdAt: new Date(),
  };

  it('acepta un producto válido', () => {
    expect(Product.create(base).id).toBe('x1');
  });

  it('rechaza price <= 0, compareAtPrice <= price y sin imágenes', () => {
    expect(() => Product.create({ ...base, price: 0 })).toThrow(/precio/);
    expect(() => Product.create({ ...base, compareAtPrice: 1000 })).toThrow(/anterior/);
    expect(() => Product.create({ ...base, images: [] })).toThrow(/imagen/);
  });
});

describe('ListProducts', () => {
  const list = new ListProducts(repo);

  it('sin filtros devuelve 24 productos, total y hasMore', async () => {
    const page = await list.execute(criteria());
    expect(page.items).toHaveLength(24);
    expect(page.total).toBe(products.length);
    expect(page.hasMore).toBe(true);
  });

  it('limit 0 devuelve solo el total', async () => {
    const page = await list.execute(criteria({ limit: 0 }));
    expect(page).toEqual({ items: [], total: products.length, page: 1, hasMore: false });
  });

  it('la última página tiene hasMore false', async () => {
    const lastPage = Math.ceil(products.length / 24);
    const page = await list.execute(criteria({ page: lastPage }));
    expect(page.hasMore).toBe(false);
  });
});

describe('GetProductById', () => {
  const get = new GetProductById(repo);

  it('devuelve el producto', async () => {
    expect((await get.execute('p001')).id).toBe('p001');
  });

  it('lanza ProductNotFoundError con un id inexistente', async () => {
    await expect(get.execute('no-existe')).rejects.toBeInstanceOf(ProductNotFoundError);
  });
});

describe('GetProductFilters', () => {
  it('devuelve valores distintos y ordenados, con tallas en orden lógico', async () => {
    const filters = await new GetProductFilters(repo).execute();
    const prices = products.map((p) => p.props.price);

    expect(new Set(filters.brands).size).toBe(filters.brands.length);
    expect(filters.brands).toEqual([...filters.brands].sort((a, b) => a.localeCompare(b, 'es')));
    expect(filters.priceRange).toEqual({ min: Math.min(...prices), max: Math.max(...prices) });
    expect(filters.sizes.slice(0, 5)).toEqual(['XS', 'S', 'M', 'L', 'XL']);
  });

  it('compareSizes: letras, luego números de calzado y al final el resto', () => {
    expect(['U', '40', 'XL', '38', 'S', 'XXL', 'XS', 'M'].sort(compareSizes)).toEqual([
      'XS',
      'S',
      'M',
      'XL',
      'XXL',
      '38',
      '40',
      'U',
    ]);
  });
});
