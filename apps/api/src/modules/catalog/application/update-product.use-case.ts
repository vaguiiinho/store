import { Inject, Injectable } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { PRODUCT_REPOSITORY } from "../catalog.tokens";
import { ProductRepository } from "../domain/repositories/product.repository";

export type UpdateProductInput = {
  productId: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images: string[];
  categoryIds: string[];
};

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(input: UpdateProductInput) {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      throw new DomainError("Produto nao encontrado.");
    }

    const nextSlug = input.slug.trim();

    if (nextSlug !== product.slug) {
      const existingProduct = await this.productRepository.findBySlug(nextSlug);

      if (existingProduct && existingProduct.id !== product.id) {
        throw new DomainError("Ja existe um produto com este slug.");
      }
    }

    product.name = input.name.trim();
    product.slug = nextSlug;
    product.description = input.description.trim();
    product.priceCents = input.priceCents;
    product.images = input.images.map((image) => image.trim()).filter(Boolean);

    const categoryIds = [...new Set(input.categoryIds.map((categoryId) => categoryId.trim()).filter(Boolean))];

    if (categoryIds.length === 0) {
      throw new DomainError("Selecione ao menos uma categoria.");
    }

    await this.productRepository.update(product, categoryIds);

    const updatedProduct = await this.productRepository.findById(product.id);

    if (!updatedProduct) {
      throw new DomainError("Produto nao encontrado.");
    }

    return updatedProduct;
  }
}
