import { readFileSync } from 'node:fs';
import { parseSeedProducts } from '../../seed/seedProducts.js';

/** Los mismos productos que siembra `npm run seed`. */
export const seedProducts = () =>
  parseSeedProducts(
    JSON.parse(readFileSync(new URL('../../seed/products.json', import.meta.url), 'utf8')),
  );

export const seedJson = () =>
  JSON.parse(readFileSync(new URL('../../seed/products.json', import.meta.url), 'utf8')) as {
    id: string;
    category: string;
    gender: string;
    sizes: string[];
    colors: string[];
    brand: string;
    price: number;
    compareAtPrice?: number;
    inStock: boolean;
  }[];
