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
  variantName?: string | null;
  variantValue?: string | null;
  variantSku?: string | null;
  availableQuantity?: number | null;
  reservedQuantity?: number | null;
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

    product.updateDetails({
      name: input.name,
      slug: nextSlug,
      description: input.description,
      priceCents: input.priceCents,
      images: input.images
    });

    const categoryIds = [...new Set(input.categoryIds.map((categoryId) => categoryId.trim()).filter(Boolean))];

    if (categoryIds.length === 0) {
      throw new DomainError("Selecione ao menos uma categoria.");
    }

    const variantName = input.variantName?.trim() ?? "";
    const variantValue = input.variantValue?.trim() ?? "";
    const variantInput =
      variantName && variantValue
        ? {
            name: variantName,
            value: variantValue,
            sku: input.variantSku?.trim() || null
          }
        : null;

    const stockInput =
      input.availableQuantity !== undefined || input.reservedQuantity !== undefined
        ? {
            availableQuantity: input.availableQuantity ?? 0,
            reservedQuantity: input.reservedQuantity ?? 0
          }
        : null;

    await this.productRepository.update(product, categoryIds, variantInput, stockInput);

    const updatedProduct = await this.productRepository.findById(product.id);

    if (!updatedProduct) {
      throw new DomainError("Produto nao encontrado.");
    }

    return updatedProduct;
  }
}
