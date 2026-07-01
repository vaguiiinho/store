import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { seedCategories, seedProducts } from "./catalog.seed-data";

@Injectable()
export class CatalogSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const productCount = await this.prisma.product.count();

    if (productCount > 0) {
      return;
    }

    for (const category of seedCategories) {
      await this.prisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          active: true
        }
      });
    }

    for (const product of seedProducts) {
      await this.prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceCents: product.priceCents,
          active: true,
          images: [...product.images],
          categories: {
            connect: product.categorySlugs.map((slug) => ({ slug }))
          },
          variants: {
            create: product.variants.map((variant) => ({
              id: variant.id,
              name: variant.name,
              value: variant.value,
              sku: variant.sku,
              active: true
            }))
          },
          stock: {
            create: {
              id: product.stock.id,
              availableQuantity: product.stock.availableQuantity,
              reservedQuantity: product.stock.reservedQuantity
            }
          }
        }
      });
    }
  }
}
