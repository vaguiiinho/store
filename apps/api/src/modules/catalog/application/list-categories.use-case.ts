import { Inject, Injectable } from "@nestjs/common";
import { CATEGORY_REPOSITORY } from "../catalog.tokens";
import { CategoryRepository } from "../domain/repositories/category.repository";

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository
  ) {}

  execute(activeOnly = true) {
    return this.categoryRepository.findAll(activeOnly);
  }
}
