import { DomainError } from "../../../shared/domain/errors/domain-error";
import { Category } from "../../domain/entities/category.entity";
import { CategoryRepository } from "../../domain/repositories/category.repository";
import { CategoryOutput, toCategoryOutput } from "../category.output";

export type CreateCategoryInput = { name: string; slug: string };
export type CreateCategoryOutput = CategoryOutput;

export class CreateCategoryUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const category = Category.create({ name: input.name, slug: input.slug });

    if (await this.categories.findBySlug(category.slug)) {
      throw new DomainError("Ja existe uma categoria com este slug.");
    }

    await this.categories.save(category);

    return toCategoryOutput(category);
  }
}
