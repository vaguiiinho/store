import { Category } from "../entities/category.entity";

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(activeOnly?: boolean): Promise<Category[]>;
  save(category: Category): Promise<void>;
}
