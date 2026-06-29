import { Module } from "@nestjs/common";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { CATEGORY_REPOSITORY, PRODUCT_REPOSITORY } from "./catalog.tokens";
import { CatalogController } from "./catalog.controller";
import { CatalogSeedService } from "./catalog.seed";
import { GetProductBySlugUseCase } from "./application/get-product-by-slug.use-case";
import { ListActiveProductsUseCase } from "./application/list-active-products.use-case";
import { ListCategoriesUseCase } from "./application/list-categories.use-case";
import { PrismaCategoryRepository } from "./infrastructure/prisma/prisma-category.repository";
import { PrismaProductRepository } from "./infrastructure/prisma/prisma-product.repository";

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [
    CatalogSeedService,
    ListActiveProductsUseCase,
    GetProductBySlugUseCase,
    ListCategoriesUseCase,
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
