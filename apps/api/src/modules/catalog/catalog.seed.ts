import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { seedCategories, seedProducts, seedUnits } from "./catalog.seed-data";

@Injectable()
export class CatalogSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const productCount = await this.prisma.product.count();

    if (productCount > 0) {
      return;
    }

    for (const unit of seedUnits) {
      await this.prisma.measurementUnit.upsert({
        where: { id: unit.id },
        create: { id: unit.id, name: unit.name, abbreviation: unit.abbreviation, active: true },
        update: {}
      });
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
          category: { connect: { slug: product.categorySlug } },
          stock: {
            create: {
              id: product.stock.id,
              unit: { connect: { id: product.stock.unitId } },
              availableQuantity: product.stock.availableQuantity,
              reservedQuantity: product.stock.reservedQuantity
            }
          }
        }
      });
    }
  }
}
