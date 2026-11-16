import { Product } from "../entities/product.entity";

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findAll(activeOnly?: boolean): Promise<Product[]>;
  save(product: Product): Promise<void>;
  /** Grava so as colunas de Product + categoryId; nunca toca em Stock/Variant. */
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
}
