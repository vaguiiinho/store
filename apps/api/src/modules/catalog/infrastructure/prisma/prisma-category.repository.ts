import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DomainError } from "../../../shared/domain/errors/domain-error";
import { Category } from "../../domain/entities/category.entity";
import { CategoryRepository } from "../../domain/repositories/category.repository";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";

type PrismaCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
};

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });

    return category ? this.toEntity(category) : null;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug }
    });

    return category ? this.toEntity(category) : null;
  }

  async findAll(activeOnly = true) {
    const categories: PrismaCategoryRecord[] = await this.prisma.category.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: [{ name: "asc" }]
    });

    return categories.map((category) => this.toEntity(category));
  }

  async save(category: Category) {
    try {
      await this.prisma.category.upsert({
        where: { id: category.id },
        create: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          active: category.active
        },
        update: {
          name: category.name,
          slug: category.slug,
          active: category.active
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new DomainError("Ja existe uma categoria com este slug.");
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new DomainError("Categoria possui produtos e nao pode ser excluida. Desative-a.");
      }
      throw error;
    }
  }

  countProducts(id: string) {
    return this.prisma.product.count({ where: { categoryId: id } });
  }

  async countProductsByCategory() {
    const groups = await this.prisma.product.groupBy({ by: ["categoryId"], _count: { _all: true } });
    return Object.fromEntries(groups.map((group) => [group.categoryId, group._count._all]));
  }

  private toEntity(category: PrismaCategoryRecord) {
    return Category.create({
      id: category.id,
      name: category.name,
      slug: category.slug,
      active: category.active
    });
  }
}
