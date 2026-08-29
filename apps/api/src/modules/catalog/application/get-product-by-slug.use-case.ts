import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../catalog.tokens";
import { ProductRepository } from "../domain/repositories/product.repository";
import { Product } from "../domain/entities/product.entity";

export type GetProductBySlugOutput = Product | null;

@Injectable()
export class GetProductBySlugUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  execute(slug: string): Promise<GetProductBySlugOutput> {
    return this.productRepository.findBySlug(slug);
  }
}
