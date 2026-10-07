import type { QueryFilter, SortOrder } from 'mongoose';
import type {
  ProductFilterOptions,
  ProductSearchCriteria,
  ProductSearchResult,
  ProductSort,
} from '../../../application/product/dtos/ProductSearchCriteria.js';
import type { ProductRepository } from '../../../application/product/ports/ProductRepository.js';
import { Product } from '../../../domain/product/entities/Product.js';
import { ProductModel, type ProductDocument } from './ProductModel.js';

// Siempre termina en _id para que el orden sea estable entre páginas.
const SORTS: Record<ProductSort, Record<string, SortOrder>> = {
  relevancia: { inStock: -1, createdAt: -1, _id: 1 },
  'precio-asc': { price: 1, _id: 1 },
  'precio-desc': { price: -1, _id: 1 },
  nuevos: { createdAt: -1, _id: 1 },
};

function toFilter(criteria: ProductSearchCriteria): QueryFilter<ProductDocument> {
  const filter: QueryFilter<ProductDocument> = {};
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
    createdAt: doc.createdAt,
  });
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
      ProductModel.distinct('category'),
      ProductModel.distinct('gender'),
      ProductModel.distinct('sizes'),
      ProductModel.distinct('colors'),
      ProductModel.distinct('brand'),
      ProductModel.aggregate<{ min: number; max: number }>([
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
}
