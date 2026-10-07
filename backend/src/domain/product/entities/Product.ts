import { AppError } from '../../../shared/errors/AppError.js';

export interface ProductProps {
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
  /** Rutas relativas; la primera es la portada */
  images: string[];
  inStock: boolean;
  description: string;
  createdAt: Date;
}

export class InvalidProductError extends AppError {
  constructor(message: string) {
    super('INVALID_PRODUCT', 422, message);
    this.name = 'InvalidProductError';
  }
}

export class Product {
  private constructor(readonly props: Readonly<ProductProps>) {}

  static create(props: ProductProps): Product {
    if (!(props.price > 0)) throw new InvalidProductError('El precio debe ser mayor que 0');
    if (props.compareAtPrice !== undefined && props.compareAtPrice <= props.price) {
      throw new InvalidProductError('El precio anterior debe ser mayor que el precio');
    }
    if (props.images.length === 0) {
      throw new InvalidProductError('El producto debe tener al menos una imagen');
    }
    return new Product({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get isOnSale(): boolean {
    return this.props.compareAtPrice !== undefined && this.props.compareAtPrice > this.props.price;
  }
}
