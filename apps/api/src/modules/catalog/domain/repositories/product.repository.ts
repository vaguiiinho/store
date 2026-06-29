import { Product } from "../entities/product.entity";

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findAll(activeOnly?: boolean): Promise<Product[]>;
  save(product: Product): Promise<void>;
}
