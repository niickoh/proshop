import { AppError } from '../../../shared/errors/AppError.js';

export interface ProductProps {
  /** Generado desde el nombre al crear; nunca editable */
  id: string;
  name: string;
  brand: string;
  category: string;
  gender: string;
  /** CLP, entero */
  price: number;
  /** Precio anterior si está en oferta */
  compareAtPrice?: number;
  sizes: string[];
  colors: string[];
  /** Rutas relativas o URLs; la primera es la portada */
  images: string[];
  inStock: boolean;
  description: string;
  /** false = archivado: no se muestra en la tienda */
  active: boolean;
  /** Se incrementa en cada cambio para que dos ediciones no se pisen */
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Campos que el admin puede escribir. */
export type ProductData = Omit<ProductProps, 'id' | 'version' | 'createdAt' | 'updatedAt'>;

export class InvalidProductError extends AppError {
  constructor(field: string, message: string) {
    super('VALIDATION_ERROR', 422, message, { [field]: message });
    this.name = 'InvalidProductError';
  }
}

export class Product {
  private constructor(readonly props: Readonly<ProductProps>) {}

  static create(props: ProductProps): Product {
    if (!(props.price > 0)) {
      throw new InvalidProductError('price', 'El precio debe ser mayor que 0');
    }
    if (props.compareAtPrice !== undefined && props.compareAtPrice <= props.price) {
      throw new InvalidProductError(
        'compareAtPrice',
        'El precio anterior debe ser mayor que el precio',
      );
    }
    if (props.images.length === 0) {
      throw new InvalidProductError('images', 'El producto debe tener al menos una imagen');
    }
    return new Product({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get isActive(): boolean {
    return this.props.active;
  }

  get isOnSale(): boolean {
    return this.props.compareAtPrice !== undefined && this.props.compareAtPrice > this.props.price;
  }
}

const randomSuffix = () => crypto.randomUUID().slice(0, 4);

/** `Polera Básica Negra` → `polera-basica-negra-4f2a` */
export function generateProductId(name: string, suffix: string = randomSuffix()): string {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
  return `${slug || 'producto'}-${suffix}`;
}
