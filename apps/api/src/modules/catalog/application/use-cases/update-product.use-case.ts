import { DomainError } from "../../../shared/domain/errors/domain-error";
import { CategoryRepository } from "../../domain/repositories/category.repository";
import { ProductRepository } from "../../domain/repositories/product.repository";
import { AdminProductOutput, toAdminProductOutput } from "../admin-product.output";

export type UpdateProductInput = {
  productId: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images: string[];
  categoryId: string;
};
export type UpdateProductOutput = AdminProductOutput;

export class UpdateProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository
  ) {}

  async execute(input: UpdateProductInput): Promise<UpdateProductOutput> {
    const product = await this.products.findById(input.productId);
    if (!product) throw new DomainError("Produto nao encontrado.");

    const nextSlug = input.slug.trim().toLowerCase();
    if (nextSlug !== product.slug) {
      const existing = await this.products.findBySlug(nextSlug);
      if (existing && existing.id !== product.id) {
        throw new DomainError("Ja existe um produto com este slug.");
      }
    }

    const category = await this.categories.findById(input.categoryId);
    if (!category) throw new DomainError("Categoria nao encontrada.");

    product.updateDetails({
      name: input.name,
      slug: nextSlug,
      description: input.description,
      priceCents: input.priceCents,
      images: input.images.map((image) => image.trim()).filter(Boolean)
    });
    product.changeCategory(category);

    await this.products.update(product);

    return toAdminProductOutput(product);
  }
}
