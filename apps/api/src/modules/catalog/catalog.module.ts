import { Module } from "@nestjs/common";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { CATEGORY_REPOSITORY, PRODUCT_REPOSITORY } from "./catalog.tokens";
import { CatalogController } from "./catalog.controller";
import { CatalogSeedService } from "./catalog.seed";
import { GetProductBySlugUseCase } from "./application/get-product-by-slug.use-case";
import { GetAdminProductUseCase } from "./application/get-admin-product.use-case";
import { ListActiveProductsUseCase } from "./application/list-active-products.use-case";
import { ListCategoriesUseCase } from "./application/list-categories.use-case";
import { ListAdminProductsUseCase } from "./application/list-admin-products.use-case";
import { CreateProductUseCase } from "./application/use-cases/create-product.use-case";
import { UpdateProductUseCase } from "./application/use-cases/update-product.use-case";
import { ListAdminCategoriesUseCase } from "./application/use-cases/list-admin-categories.use-case";
import { CreateCategoryUseCase } from "./application/use-cases/create-category.use-case";
import { UpdateCategoryUseCase } from "./application/use-cases/update-category.use-case";
import { DeleteCategoryUseCase } from "./application/use-cases/delete-category.use-case";
import { AdminCategoriesController } from "./presentation/admin-categories.controller";
import { MEASUREMENT_UNIT_REPOSITORY } from "../inventory/inventory.tokens";
import { MeasurementUnitRepository } from "../inventory/domain/repositories/measurement-unit.repository";
import { CategoryRepository } from "./domain/repositories/category.repository";
import { ProductRepository } from "./domain/repositories/product.repository";
import { UpdateProductStatusUseCase } from "./application/update-product-status.use-case";
import { DeleteProductUseCase } from "./application/delete-product.use-case";
import { AdjustProductStockUseCase } from "./application/adjust-product-stock.use-case";
import { InventoryModule } from "../inventory/inventory.module";
import { PrismaCategoryRepository } from "./infrastructure/prisma/prisma-category.repository";
import { PrismaProductRepository } from "./infrastructure/prisma/prisma-product.repository";
import { AdminProductsController } from "./presentation/admin-products.controller";

@Module({
  imports: [PrismaModule, InventoryModule],
  controllers: [CatalogController, AdminProductsController, AdminCategoriesController],
  providers: [
    CatalogSeedService,
    ListActiveProductsUseCase,
    ListAdminProductsUseCase,
    GetAdminProductUseCase,
    GetProductBySlugUseCase,
    ListCategoriesUseCase,
    UpdateProductStatusUseCase,
    DeleteProductUseCase,
    AdjustProductStockUseCase,
    {
      provide: CreateProductUseCase,
      useFactory: (p: ProductRepository, c: CategoryRepository, u: MeasurementUnitRepository) =>
        new CreateProductUseCase(p, c, u),
      inject: [PRODUCT_REPOSITORY, CATEGORY_REPOSITORY, MEASUREMENT_UNIT_REPOSITORY]
    },
    {
      provide: UpdateProductUseCase,
      useFactory: (p: ProductRepository, c: CategoryRepository) => new UpdateProductUseCase(p, c),
      inject: [PRODUCT_REPOSITORY, CATEGORY_REPOSITORY]
    },
    {
      provide: ListAdminCategoriesUseCase,
      useFactory: (c: CategoryRepository) => new ListAdminCategoriesUseCase(c),
      inject: [CATEGORY_REPOSITORY]
    },
    {
      provide: CreateCategoryUseCase,
      useFactory: (c: CategoryRepository) => new CreateCategoryUseCase(c),
      inject: [CATEGORY_REPOSITORY]
    },
    {
      provide: UpdateCategoryUseCase,
      useFactory: (c: CategoryRepository) => new UpdateCategoryUseCase(c),
      inject: [CATEGORY_REPOSITORY]
    },
    {
      provide: DeleteCategoryUseCase,
      useFactory: (c: CategoryRepository) => new DeleteCategoryUseCase(c),
      inject: [CATEGORY_REPOSITORY]
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository
    }
  ]
})
export class CatalogModule {}
