import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { CATEGORY_REPOSITORY, PRODUCT_REPOSITORY } from "../catalog.tokens";
import { CategoryRepository } from "../domain/repositories/category.repository";
import { ProductRepository } from "../domain/repositories/product.repository";
import { Category } from "../domain/entities/category.entity";
import { Product } from "../domain/entities/product.entity";
import { Variant } from "../domain/entities/variant.entity";
import { Stock } from "../../inventory/domain/entities/stock.entity";

export type CreateProductInput = {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images: string[];
  categoryIds: string[];
  variantName?: string | null;
  variantValue?: string | null;
  variantSku?: string | null;
  availableQuantity?: number | null;
  reservedQuantity?: number | null;
};
export type CreateProductOutput = Product;

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(input: CreateProductInput): Promise<CreateProductOutput> {
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

    const productId = randomUUID();
    const variant =
      input.variantName && input.variantValue
        ? Variant.create({
            id: randomUUID(),
            productId,
            name: input.variantName.trim(),
            value: input.variantValue.trim(),
            sku: input.variantSku?.trim() || null,
            active: true
          })
        : null;

    const product = Product.create({
      id: productId,
      name: input.name.trim(),
      slug,
      description: input.description.trim(),
      priceCents: input.priceCents,
      images: input.images.map((image) => image.trim()).filter(Boolean),
      categories: selectedCategories,
      variants: variant ? [variant] : [],
      stock: Stock.create({
        id: randomUUID(),
        productId,
        availableQuantity: input.availableQuantity ?? 0,
        reservedQuantity: input.reservedQuantity ?? 0
      })
    });

    await this.productRepository.save(product);

    const createdProduct = await this.productRepository.findById(product.id);

    if (!createdProduct) {
      throw new DomainError("Produto nao encontrado.");
    }

    return createdProduct;
  }
}
