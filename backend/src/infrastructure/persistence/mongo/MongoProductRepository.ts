import type { QueryFilter, SortOrder, UpdateQuery } from 'mongoose';
import type {
  AdminProductSearchCriteria,
  AdminProductSort,
  AdminProductStatus,
} from '../../../application/product/dtos/AdminProductSearchCriteria.js';
import type {
  ProductFilterOptions,
  ProductSearchCriteria,
  ProductSearchResult,
  ProductSort,
} from '../../../application/product/dtos/ProductSearchCriteria.js';
import type { ProductRepository } from '../../../application/product/ports/ProductRepository.js';
import { Product, type ProductData } from '../../../domain/product/entities/Product.js';
import { ProductModel, type ProductDocument } from './ProductModel.js';

// Siempre termina en _id para que el orden sea estable entre páginas.
const SORTS: Record<ProductSort, Record<string, SortOrder>> = {
  relevancia: { inStock: -1, createdAt: -1, _id: 1 },
  'precio-asc': { price: 1, _id: 1 },
  'precio-desc': { price: -1, _id: 1 },
  nuevos: { createdAt: -1, _id: 1 },
};

const ADMIN_SORTS: Record<AdminProductSort, Record<string, SortOrder>> = {
  nuevos: { createdAt: -1, _id: 1 },
  nombre: { name: 1, _id: 1 },
  'precio-asc': { price: 1, _id: 1 },
  'precio-desc': { price: -1, _id: 1 },
};

// Orden alfabético en español sin distinguir mayúsculas ni tildes
const SPANISH = { locale: 'es', strength: 1 };

// `$ne: false` incluye los productos sembrados antes de que existiera `active`
const ACTIVE: QueryFilter<ProductDocument> = { active: { $ne: false } };

const STATUS_FILTERS: Record<AdminProductStatus, QueryFilter<ProductDocument>> = {
  active: ACTIVE,
  archived: { active: false },
  all: {},
};

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function toFilter(criteria: ProductSearchCriteria): QueryFilter<ProductDocument> {
  const filter: QueryFilter<ProductDocument> = { ...ACTIVE };
  if (criteria.category?.length) filter.category = { $in: criteria.category };
  if (criteria.gender?.length) filter.gender = { $in: criteria.gender };
  if (criteria.size?.length) filter.sizes = { $in: criteria.size };
  if (criteria.color?.length) filter.colors = { $in: criteria.color };
  if (criteria.brand?.length) filter.brand = { $in: criteria.brand };
  if (criteria.priceMin !== undefined || criteria.priceMax !== undefined) {
    filter.price = {
      ...(criteria.priceMin !== undefined && { $gte: criteria.priceMin }),
      ...(criteria.priceMax !== undefined && { $lte: criteria.priceMax }),
    };
  }
  if (criteria.inStockOnly) filter.inStock = true;
  if (criteria.onSale) filter.$expr = { $gt: ['$compareAtPrice', '$price'] };
  return filter;
}

function toAdminFilter(criteria: AdminProductSearchCriteria): QueryFilter<ProductDocument> {
  const filter: QueryFilter<ProductDocument> = { ...STATUS_FILTERS[criteria.status] };
  if (criteria.category) filter.category = criteria.category;
  if (criteria.q) {
    const pattern = new RegExp(escapeRegex(criteria.q), 'i');
    filter.$or = [{ name: pattern }, { brand: pattern }];
  }
  return filter;
}

function toEntity(doc: ProductDocument): Product {
  return Product.create({
    id: doc._id,
    name: doc.name,
    brand: doc.brand,
    category: doc.category,
    gender: doc.gender,
    price: doc.price,
    ...(doc.compareAtPrice != null && { compareAtPrice: doc.compareAtPrice }),
    sizes: [...doc.sizes],
    colors: [...doc.colors],
    images: [...doc.images],
    inStock: doc.inStock,
    description: doc.description,
    active: doc.active ?? true,
    version: doc.version ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt ?? doc.createdAt,
  });
}

/** Reemplaza los datos editables; un `compareAtPrice` ausente se borra. */
function replaceData(data: ProductData): UpdateQuery<ProductDocument> {
  const { compareAtPrice, ...rest } = data;
  return {
    $set: { ...rest, ...(compareAtPrice !== undefined && { compareAtPrice }) },
    ...(compareAtPrice === undefined && { $unset: { compareAtPrice: 1 } }),
  };
}

export class MongoProductRepository implements ProductRepository {
  async search(criteria: ProductSearchCriteria): Promise<ProductSearchResult> {
    const filter = toFilter(criteria);
    const [docs, total] = await Promise.all([
      criteria.limit > 0
        ? ProductModel.find(filter)
            .sort(SORTS[criteria.sort])
            .skip((criteria.page - 1) * criteria.limit)
            .limit(criteria.limit)
            .lean<ProductDocument[]>()
        : Promise.resolve([]),
      ProductModel.countDocuments(filter),
    ]);
    return { items: docs.map(toEntity), total };
  }

  async findById(id: string): Promise<Product | null> {
    const doc = await ProductModel.findById(id).lean<ProductDocument>();
    return doc ? toEntity(doc) : null;
  }

  async getFilterOptions(): Promise<ProductFilterOptions> {
    const [categories, genders, sizes, colors, brands, prices] = await Promise.all([
      ProductModel.distinct('category', ACTIVE),
      ProductModel.distinct('gender', ACTIVE),
      ProductModel.distinct('sizes', ACTIVE),
      ProductModel.distinct('colors', ACTIVE),
      ProductModel.distinct('brand', ACTIVE),
      ProductModel.aggregate<{ min: number; max: number }>([
        { $match: ACTIVE },
        { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
      ]),
    ]);
    return {
      categories,
      genders,
      sizes,
      colors,
      brands,
      priceRange: { min: prices[0]?.min ?? 0, max: prices[0]?.max ?? 0 },
    };
  }

  async searchAdmin(criteria: AdminProductSearchCriteria): Promise<ProductSearchResult> {
    const filter = toAdminFilter(criteria);
    const [docs, total] = await Promise.all([
      ProductModel.find(filter)
        .collation(SPANISH)
        .sort(ADMIN_SORTS[criteria.sort])
        .skip((criteria.page - 1) * criteria.limit)
        .limit(criteria.limit)
        .lean<ProductDocument[]>(),
      ProductModel.countDocuments(filter),
    ]);
    return { items: docs.map(toEntity), total };
  }

  async create(product: Product): Promise<Product> {
    const { id, ...rest } = product.props;
    await ProductModel.create({ _id: id, ...rest });
    return product;
  }

  async update(id: string, data: ProductData, expectedVersion: number): Promise<Product | null> {
    const update = replaceData(data);
    const doc = await ProductModel.findOneAndUpdate(
      {
        _id: id,
        // Versión 0 también coincide con productos sembrados sin el campo
        version: expectedVersion === 0 ? { $in: [0, null] } : expectedVersion,
      },
      {
        ...update,
        $set: { ...update.$set, version: expectedVersion + 1, updatedAt: new Date() },
      },
      { returnDocument: 'after' },
    ).lean<ProductDocument>();
    return doc ? toEntity(doc) : null;
  }

  async setActive(id: string, active: boolean): Promise<Product | null> {
    const doc = await ProductModel.findByIdAndUpdate(
      id,
      { $set: { active, updatedAt: new Date() }, $inc: { version: 1 } },
      { returnDocument: 'after' },
    ).lean<ProductDocument>();
    return doc ? toEntity(doc) : null;
  }
}
