import { MeasurementUnitRepository } from "../../../inventory/domain/repositories/measurement-unit.repository";
import { Stock } from "../../../inventory/domain/entities/stock.entity";
import { DomainError } from "../../../shared/domain/errors/domain-error";
import { Product } from "../../domain/entities/product.entity";
import { CategoryRepository } from "../../domain/repositories/category.repository";
import { ProductRepository } from "../../domain/repositories/product.repository";
import { AdminProductOutput, toAdminProductOutput } from "../admin-product.output";

export type CreateProductInput = {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images: string[];
  categoryId: string;
  unitId: string;
};
export type CreateProductOutput = AdminProductOutput;

export class CreateProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository,
    private readonly units: MeasurementUnitRepository
  ) {}

  async execute(input: CreateProductInput): Promise<CreateProductOutput> {
    const slug = input.slug.trim().toLowerCase();

    if (await this.products.findBySlug(slug)) {
      throw new DomainError("Ja existe um produto com este slug.");
    }

    const category = await this.categories.findById(input.categoryId);
    if (!category) throw new DomainError("Categoria nao encontrada.");
    category.ensureAssignable();

    const unit = await this.units.findById(input.unitId);
    if (!unit) throw new DomainError("Unidade de medida nao encontrada.");

    const product = Product.create({
      name: input.name,
      slug,
      description: input.description,
      priceCents: input.priceCents,
      images: input.images.map((image) => image.trim()).filter(Boolean),
      category
    });
    product.stock = Stock.open({ productId: product.id, unit });

    await this.products.save(product);

    return toAdminProductOutput(product);
  }
}
