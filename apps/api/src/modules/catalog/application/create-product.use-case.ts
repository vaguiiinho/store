import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { CATEGORY_REPOSITORY, PRODUCT_REPOSITORY } from "../catalog.tokens";
import { CategoryRepository } from "../domain/repositories/category.repository";
import { ProductRepository } from "../domain/repositories/product.repository";
import { Category } from "../domain/entities/category.entity";
import { Product } from "../domain/entities/product.entity";

export type CreateProductInput = {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images: string[];
  categoryIds: string[];
};

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(input: CreateProductInput) {
    const slug = input.slug.trim();
    const existingProduct = await this.productRepository.findBySlug(slug);

    if (existingProduct) {
      throw new DomainError("Ja existe um produto com este slug.");
    }

    const categories = await this.categoryRepository.findAll(true);
    const categoryMap = new Map(categories.map((category) => [category.id, category] as const));
    const uniqueCategoryIds = [...new Set(input.categoryIds.map((categoryId) => categoryId.trim()).filter(Boolean))];

    if (uniqueCategoryIds.length === 0) {
      throw new DomainError("Selecione ao menos uma categoria.");
    }

    const selectedCategories = uniqueCategoryIds
      .map((categoryId) => categoryMap.get(categoryId))
      .filter((category): category is Category => Boolean(category));

    if (selectedCategories.length !== uniqueCategoryIds.length) {
      throw new DomainError("Categoria invalida.");
    }

    const product = Product.create({
      id: randomUUID(),
      name: input.name.trim(),
      slug,
      description: input.description.trim(),
      priceCents: input.priceCents,
      images: input.images.map((image) => image.trim()).filter(Boolean),
      categories: selectedCategories
    });

    await this.productRepository.save(product);

    const createdProduct = await this.productRepository.findById(product.id);

    if (!createdProduct) {
      throw new DomainError("Produto nao encontrado.");
    }

    return createdProduct;
  }
}
