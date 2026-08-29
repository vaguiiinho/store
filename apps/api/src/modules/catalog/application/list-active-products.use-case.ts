import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../catalog.tokens";
import { ProductRepository } from "../domain/repositories/product.repository";
import { Product } from "../domain/entities/product.entity";

export type ListActiveProductsOutput = Product[];

@Injectable()
export class ListActiveProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  execute(): Promise<ListActiveProductsOutput> {
    return this.productRepository.findAll(true);
  }
}
