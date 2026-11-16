import { DomainError } from "../../../shared/domain/errors/domain-error";
import { CategoryRepository } from "../../domain/repositories/category.repository";

export type DeleteCategoryInput = { categoryId: string };
export type DeleteCategoryOutput = { deleted: true };

export class DeleteCategoryUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const category = await this.categories.findById(input.categoryId);
    if (!category) throw new DomainError("Categoria nao encontrada.");

    if ((await this.categories.countProducts(category.id)) > 0) {
      throw new DomainError("Categoria possui produtos e nao pode ser excluida. Desative-a.");
    }

    await this.categories.delete(category.id);

    return { deleted: true };
  }
}
