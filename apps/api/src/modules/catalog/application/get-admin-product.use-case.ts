import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../catalog.tokens";
import { ProductRepository } from "../domain/repositories/product.repository";

@Injectable()
export class GetAdminProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  execute(productId: string) {
    return this.productRepository.findById(productId);
  }
}
