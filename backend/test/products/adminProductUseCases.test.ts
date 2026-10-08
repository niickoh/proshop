import { beforeEach, describe, expect, it } from 'vitest';
import { CreateProduct } from '../../src/application/product/use-cases/CreateProduct.js';
import { GetAdminProduct } from '../../src/application/product/use-cases/GetAdminProduct.js';
import { GetProductById } from '../../src/application/product/use-cases/GetProductById.js';
import { ListAdminProducts } from '../../src/application/product/use-cases/ListAdminProducts.js';
import { ListProducts } from '../../src/application/product/use-cases/ListProducts.js';
import { SetProductStatus } from '../../src/application/product/use-cases/SetProductStatus.js';
import { UpdateProduct } from '../../src/application/product/use-cases/UpdateProduct.js';
import {
  generateProductId,
  InvalidProductError,
  type ProductData,
} from '../../src/domain/product/entities/Product.js';
import { ProductNotFoundError } from '../../src/domain/product/errors/ProductNotFoundError.js';
import { VersionConflictError } from '../../src/domain/product/errors/VersionConflictError.js';
import { seedProducts } from './fixtures.js';
import { InMemoryProductRepository } from './InMemoryProductRepository.js';

const input: ProductData = {
  name: 'Polera básica negra',
  brand: 'Andes Wear',
  category: 'poleras',
  gender: 'unisex',
  description: 'Polera de algodón peinado, corte recto y costuras reforzadas.',
  price: 12990,
  compareAtPrice: 15990,
  sizes: ['S', 'M'],
  colors: ['negro'],
  images: ['/products/poleras-1.svg'],
  inStock: true,
  active: true,
};

let repo: InMemoryProductRepository;

beforeEach(() => {
  repo = new InMemoryProductRepository(seedProducts());
});

describe('generateProductId', () => {
  it('genera un slug desde el nombre con sufijo', () => {
    expect(generateProductId('Polera Básica  Negra!', '4f2a')).toBe('polera-basica-negra-4f2a');
    expect(generateProductId('Ñandú', 'ab12')).toBe('nandu-ab12');
  });
});

describe('CreateProduct', () => {
  it('crea con id desde el nombre, versión 0 y fechas', async () => {
    const product = await new CreateProduct(repo).execute(input);
    expect(product.id).toMatch(/^polera-basica-negra-[0-9a-f]{4}$/);
    expect(product.props).toMatchObject({ version: 0, active: true });
    expect(product.props.updatedAt).toEqual(product.props.createdAt);
    expect(await repo.findById(product.id)).not.toBeNull();
  });

  it('aplica las reglas de la entidad (precio anterior y al menos una imagen)', async () => {
    const create = new CreateProduct(repo);
    await expect(create.execute({ ...input, compareAtPrice: input.price })).rejects.toMatchObject({
      status: 422,
      fields: { compareAtPrice: expect.any(String) },
    });
    await expect(create.execute({ ...input, images: [] })).rejects.toBeInstanceOf(
      InvalidProductError,
    );
  });
});

describe('UpdateProduct', () => {
  it('reemplaza los datos e incrementa la versión', async () => {
    const updated = await new UpdateProduct(repo).execute('p001', {
      ...input,
      compareAtPrice: undefined,
      version: 0,
    });
    expect(updated.props).toMatchObject({ name: input.name, version: 1 });
    expect(updated.props.compareAtPrice).toBeUndefined();
  });

  it('con una versión desactualizada lanza VersionConflictError y no modifica', async () => {
    const update = new UpdateProduct(repo);
    await update.execute('p001', { ...input, version: 0 });
    await expect(
      update.execute('p001', { ...input, name: 'Otro nombre', version: 0 }),
    ).rejects.toBeInstanceOf(VersionConflictError);
    expect((await repo.findById('p001'))?.props.name).toBe(input.name);
  });

  it('un id inexistente lanza ProductNotFoundError', async () => {
    await expect(
      new UpdateProduct(repo).execute('no-existe', { ...input, version: 0 }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
  });
});

describe('SetProductStatus y visibilidad pública', () => {
  it('archivar oculta el producto de la tienda; reactivarlo lo vuelve a mostrar', async () => {
    const setStatus = new SetProductStatus(repo);
    const list = () => new ListProducts(repo).execute({ sort: 'relevancia', page: 1, limit: 48 });
    const total = (await list()).total;

    const archived = await setStatus.execute('p001', false);
    expect(archived.props).toMatchObject({ active: false, version: 1 });
    expect((await list()).total).toBe(total - 1);
    await expect(new GetProductById(repo).execute('p001')).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );
    expect((await new GetAdminProduct(repo).execute('p001')).props.active).toBe(false);

    await setStatus.execute('p001', true);
    expect((await list()).total).toBe(total);
    expect((await new GetProductById(repo).execute('p001')).id).toBe('p001');
  });
});

describe('ListAdminProducts', () => {
  const list = (patch = {}) =>
    new ListAdminProducts(repo).execute({
      status: 'all',
      sort: 'nuevos',
      page: 1,
      limit: 20,
      ...patch,
    });

  it('pagina y devuelve totalPages', async () => {
    const page = await list({ limit: 7 });
    expect(page.items).toHaveLength(7);
    expect(page.totalPages).toBe(Math.ceil(page.total / 7));
  });

  it('filtra por estado, búsqueda y categoría', async () => {
    await new SetProductStatus(repo).execute('p001', false);
    expect((await list({ status: 'archived' })).items.map((p) => p.id)).toEqual(['p001']);

    const brand = (await repo.findById('p002'))!.props.brand;
    const byBrand = await list({ q: brand.toLowerCase(), limit: 50 });
    expect(byBrand.items.every((p) => p.props.brand === brand)).toBe(true);

    const poleras = await list({ category: 'poleras', limit: 50 });
    expect(poleras.items.every((p) => p.props.category === 'poleras')).toBe(true);
  });

  it('ordena por nombre', async () => {
    const names = (await list({ sort: 'nombre', limit: 50 })).items.map((p) => p.props.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es')));
  });
});
