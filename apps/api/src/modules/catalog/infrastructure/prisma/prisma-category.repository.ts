import { Injectable } from "@nestjs/common";
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
