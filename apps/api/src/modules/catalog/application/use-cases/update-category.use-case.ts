import { DomainError } from "../../../shared/domain/errors/domain-error";
import { CategoryRepository } from "../../domain/repositories/category.repository";
import { CategoryOutput, toCategoryOutput } from "../category.output";

export type UpdateCategoryInput = { categoryId: string; name: string; slug: string; active: boolean };
export type UpdateCategoryOutput = CategoryOutput;

export class UpdateCategoryUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const category = await this.categories.findById(input.categoryId);
    if (!category) throw new DomainError("Categoria nao encontrada.");

    category.rename(input.name, input.slug);

    const existing = await this.categories.findBySlug(category.slug);
    if (existing && existing.id !== category.id) {
      throw new DomainError("Ja existe uma categoria com este slug.");
    }

    if (input.active) category.activate();
    else category.deactivate();

    await this.categories.save(category);

    return toCategoryOutput(category);
  }
}
