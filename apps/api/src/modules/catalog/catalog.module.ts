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
import { UpdateProductUseCase } from "./application/update-product.use-case";
import { UpdateProductStatusUseCase } from "./application/update-product-status.use-case";
import { PrismaCategoryRepository } from "./infrastructure/prisma/prisma-category.repository";
import { PrismaProductRepository } from "./infrastructure/prisma/prisma-product.repository";
import { AdminProductsController } from "./presentation/admin-products.controller";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [CatalogController, AdminProductsController],
  providers: [
    CatalogSeedService,
    ListActiveProductsUseCase,
    ListAdminProductsUseCase,
    GetAdminProductUseCase,
    GetProductBySlugUseCase,
    ListCategoriesUseCase,
    UpdateProductUseCase,
    UpdateProductStatusUseCase,
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
