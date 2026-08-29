import { Inject, Injectable } from "@nestjs/common";
import { CATEGORY_REPOSITORY } from "../catalog.tokens";
import { CategoryRepository } from "../domain/repositories/category.repository";
import { Category } from "../domain/entities/category.entity";

export type ListCategoriesOutput = Category[];

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository
  ) {}

  execute(activeOnly = true): Promise<ListCategoriesOutput> {
    return this.categoryRepository.findAll(activeOnly);
  }
}
