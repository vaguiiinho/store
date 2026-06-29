import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { Category } from "../../domain/entities/category.entity";
import { Product } from "../../domain/entities/product.entity";
import { Variant } from "../../domain/entities/variant.entity";
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
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    active: boolean;
  }>;
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
  } | null;
};

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        variants: true,
        stock: true
      }
    });

    return product ? this.toEntity(product) : null;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        categories: true,
        variants: true,
        stock: true
      }
    });

    return product ? this.toEntity(product) : null;
  }

  async findAll(activeOnly = true) {
    const products: PrismaProductRecord[] = await this.prisma.product.findMany({
      where: activeOnly ? { active: true } : undefined,
      include: {
        categories: true,
        variants: true,
        stock: true
      },
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
        categories: {
          connect: product.categories.map((category) => ({ id: category.id }))
        },
        variants: {
          create: product.variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            value: variant.value,
            sku: variant.sku,
            active: variant.active
          }))
        },
        stock: product.stock
          ? {
              create: {
                id: product.stock.id,
                availableQuantity: product.stock.available,
                reservedQuantity: product.stock.reserved
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

  private toEntity(product: PrismaProductRecord) {
    return Product.create({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceCents: product.priceCents,
      images: product.images,
      active: product.active,
      categories: product.categories.map((category) =>
        Category.create({
          id: category.id,
          name: category.name,
          slug: category.slug,
          active: category.active
        })
      ),
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
            reservedQuantity: product.stock.reservedQuantity
          })
        : null
    });
  }
}
