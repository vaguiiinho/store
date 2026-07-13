import { Inject, Injectable } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { STOCK_REPOSITORY } from "../../inventory/inventory.tokens";
import { StockRepository } from "../../inventory/domain/repositories/stock.repository";
import { PRODUCT_REPOSITORY } from "../catalog.tokens";
import { ProductRepository } from "../domain/repositories/product.repository";

@Injectable()
export class AdjustProductStockUseCase {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository, @Inject(STOCK_REPOSITORY) private readonly stocks: StockRepository) {}
  async execute(productId: string, delta: number) {
    const product = await this.products.findById(productId);
    if (!product) throw new DomainError("Produto nao encontrado.");
    await this.stocks.adjustAvailable(product.id, null, delta);
    return this.products.findById(product.id);
  }
}
