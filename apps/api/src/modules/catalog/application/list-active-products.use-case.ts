import { ProductRepository } from "../domain/repositories/product.repository";

export class ListActiveProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute() {
    return this.productRepository.findAll(true);
  }
}
