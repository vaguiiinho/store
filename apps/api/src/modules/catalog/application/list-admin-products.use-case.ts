import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../catalog.tokens";
import { ProductRepository } from "../domain/repositories/product.repository";
import { Product } from "../domain/entities/product.entity";

export type ListAdminProductsOutput = Product[];

@Injectable()
export class ListAdminProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(): Promise<ListAdminProductsOutput> {
    return this.productRepository.findAll(false);
  }
}
