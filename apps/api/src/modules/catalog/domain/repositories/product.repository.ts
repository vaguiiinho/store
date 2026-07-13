import { Product } from "../entities/product.entity";

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findAll(activeOnly?: boolean): Promise<Product[]>;
  save(product: Product): Promise<void>;
  update(
    product: Product,
    categoryIds: string[],
    variantInput: { name: string; value: string; sku: string | null } | null,
    stockInput: { availableQuantity: number; reservedQuantity: number } | null
  ): Promise<void>;
  delete(id: string): Promise<void>;
}
