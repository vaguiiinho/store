import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../catalog.tokens";
import { ProductRepository } from "../domain/repositories/product.repository";
import { Product } from "../domain/entities/product.entity";

export type GetAdminProductOutput = Product | null;

@Injectable()
export class GetAdminProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  execute(productId: string): Promise<GetAdminProductOutput> {
    return this.productRepository.findById(productId);
  }
}
