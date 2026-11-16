import { CategoryRepository } from "../../domain/repositories/category.repository";
import { CategoryOutput, toCategoryOutput } from "../category.output";

export type ListAdminCategoriesInput = Record<string, never>;
export type ListAdminCategoriesOutput = Array<CategoryOutput & { productCount: number }>;

export class ListAdminCategoriesUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(_input: ListAdminCategoriesInput = {}): Promise<ListAdminCategoriesOutput> {
    const [all, counts] = await Promise.all([this.categories.findAll(false), this.categories.countProductsByCategory()]);

    return all
      .map((category) => ({ ...toCategoryOutput(category), productCount: counts[category.id] ?? 0 }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
