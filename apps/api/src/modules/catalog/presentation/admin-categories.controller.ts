import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { AdminOnly } from "../../auth/presentation/decorators";
import { runUseCase } from "../../shared/presentation/domain-error.http";
import { CreateCategoryUseCase } from "../application/use-cases/create-category.use-case";
import { DeleteCategoryUseCase } from "../application/use-cases/delete-category.use-case";
import { ListAdminCategoriesUseCase } from "../application/use-cases/list-admin-categories.use-case";
import { UpdateCategoryUseCase } from "../application/use-cases/update-category.use-case";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

const uuid = new ParseUUIDPipe({ version: "4" });

@AdminOnly()
@Controller()
export class AdminCategoriesController {
  constructor(
    private readonly listCategories: ListAdminCategoriesUseCase,
    private readonly createCategory: CreateCategoryUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase
  ) {}

  @Get("admin/categories")
  list() {
    return runUseCase(() => this.listCategories.execute({}));
  }

  @Post("admin/categories")
  create(@Body() body: CreateCategoryDto) {
    return runUseCase(() => this.createCategory.execute({ name: body.name, slug: body.slug }));
  }

  @Patch("admin/categories/:id")
  update(@Param("id", uuid) id: string, @Body() body: UpdateCategoryDto) {
    return runUseCase(() =>
      this.updateCategory.execute({ categoryId: id, name: body.name, slug: body.slug, active: body.active })
    );
  }

  @Delete("admin/categories/:id")
  remove(@Param("id", uuid) id: string) {
    return runUseCase(() => this.deleteCategory.execute({ categoryId: id }));
  }
}
