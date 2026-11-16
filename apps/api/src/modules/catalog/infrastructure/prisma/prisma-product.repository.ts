import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { Category } from "../../domain/entities/category.entity";
import { Product } from "../../domain/entities/product.entity";
import { Variant } from "../../domain/entities/variant.entity";
import { MeasurementUnit } from "../../../inventory/domain/entities/measurement-unit.entity";
import { Stock } from "../../../inventory/domain/entities/stock.entity";
import { ProductRepository } from "../../domain/repositories/product.repository";

type PrismaProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  active: boolean;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
    active: boolean;
  };
  variants: Array<{
    id: string;
    productId: string;
    name: string;
    value: string;
    sku: string | null;
    active: boolean;
  }>;
  stock: {
    id: string;
    productId: string;
    variantId: string | null;
    availableQuantity: number;
    reservedQuantity: number;
    unit: { id: string; name: string; abbreviation: string; active: boolean };
  } | null;
};

const productInclude = {
  category: true,
  variants: true,
  stock: { include: { unit: true } }
} as const;

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: productInclude });

    return product ? this.toEntity(product) : null;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: productInclude });

    return product ? this.toEntity(product) : null;
  }

  async findAll(activeOnly = true) {
    const products: PrismaProductRecord[] = await this.prisma.product.findMany({
      where: activeOnly ? { active: true } : undefined,
      include: productInclude,
      orderBy: [{ createdAt: "desc" }]
    });

    return products.map((product) => this.toEntity(product));
  }

  async save(product: Product) {
    await this.prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        active: product.active,
        images: product.images,
        category: { connect: { id: product.category.id } },
        stock: product.stock
          ? {
              create: {
                id: product.stock.id,
                availableQuantity: product.stock.available,
                reservedQuantity: product.stock.reserved,
                unit: { connect: { id: product.stock.unit.id } }
              }
            }
          : undefined
      },
      update: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        active: product.active,
        images: product.images
      }
    });
  }

  async update(product: Product) {
    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        active: product.active,
        images: product.images,
        categoryId: product.category.id
      }
    });
  }

  async delete(id: string) {
    await this.prisma.product.delete({ where: { id } });
  }

  private toEntity(product: PrismaProductRecord) {
    return Product.create({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceCents: product.priceCents,
      images: product.images,
      active: product.active,
      category: Category.create({
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        active: product.category.active
      }),
      variants: product.variants.map((variant) =>
        Variant.create({
          id: variant.id,
          productId: variant.productId,
          name: variant.name,
          value: variant.value,
          sku: variant.sku,
          active: variant.active
        })
      ),
      stock: product.stock
        ? Stock.create({
            id: product.stock.id,
            productId: product.id,
            variantId: product.stock.variantId,
            availableQuantity: product.stock.availableQuantity,
            reservedQuantity: product.stock.reservedQuantity,
            unit: MeasurementUnit.create(product.stock.unit)
          })
        : null
    });
  }
}
