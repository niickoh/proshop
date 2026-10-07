import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import pino from 'pino';
import { z } from 'zod';
import { loadEnv } from '../src/config/env.js';
import { Product } from '../src/domain/product/entities/Product.js';
import { ProductResponse } from '../src/infrastructure/http/products/productSchemas.js';
import { connectMongo, disconnectMongo } from '../src/infrastructure/persistence/mongo/connection.js';
import { ProductModel } from '../src/infrastructure/persistence/mongo/ProductModel.js';

const SeedFile = z.array(ProductResponse.extend({ createdAt: z.iso.datetime() }));

/** Valida todos los productos (Zod + reglas de dominio) antes de escribir; si uno falla, no escribe nada. */
export function parseSeedProducts(input: unknown): Product[] {
  const result = SeedFile.safeParse(input);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`products.json inválido:\n${problems.join('\n')}`);
  }
  return result.data.map((item, index) => {
    try {
      return Product.create({ ...item, createdAt: new Date(item.createdAt) });
    } catch (error) {
      throw new Error(
        `products.json inválido en [${index}] (${item.id}): ${(error as Error).message}`,
        { cause: error },
      );
    }
  });
}

/** Upsert por _id: se puede correr varias veces sin duplicar. */
export async function seedProducts(products: Product[]): Promise<number> {
  await ProductModel.syncIndexes();
  const result = await ProductModel.bulkWrite(
    products.map(({ props: { id, ...rest } }) => ({
      replaceOne: { filter: { _id: id }, replacement: { _id: id, ...rest }, upsert: true },
    })),
  );
  return result.upsertedCount + result.modifiedCount;
}

async function main(): Promise<void> {
  const logger = pino();
  const env = loadEnv();
  const products = parseSeedProducts(
    JSON.parse(readFileSync(new URL('./products.json', import.meta.url), 'utf8')),
  );
  await connectMongo(env.MONGO_URI);
  try {
    const changed = await seedProducts(products);
    logger.info({ total: products.length, changed }, 'Seed de productos completado');
  } finally {
    await disconnectMongo();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    pino().fatal({ err: error }, 'El seed de productos falló');
    process.exit(1);
  });
}
