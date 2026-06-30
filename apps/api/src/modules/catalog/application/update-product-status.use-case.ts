import { Inject, Injectable } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { PRODUCT_REPOSITORY } from "../catalog.tokens";
import { ProductRepository } from "../domain/repositories/product.repository";

export type UpdateProductStatusInput = {
  productId: string;
  active: boolean;
};

@Injectable()
export class UpdateProductStatusUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(input: UpdateProductStatusInput) {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      throw new DomainError("Produto nao encontrado.");
    }

    if (input.active) {
      product.activate();
    } else {
      product.deactivate();
    }

    await this.productRepository.save(product);

    return product;
  }
}
