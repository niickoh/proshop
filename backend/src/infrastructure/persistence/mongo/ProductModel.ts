import { model, Schema, type InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    // Mismo id string que el frontend (no ObjectId) para no romper carritos guardados.
    _id: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    gender: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    images: { type: [String], default: [] },
    inStock: { type: Boolean, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, required: true },
  },
  { collection: 'products', versionKey: false },
);

productSchema.index({ category: 1, gender: 1, price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ sizes: 1 });
productSchema.index({ colors: 1 });
productSchema.index({ inStock: -1, createdAt: -1 });

export type ProductDocument = InferSchemaType<typeof productSchema> & { _id: string };

export const ProductModel = model('Product', productSchema);
