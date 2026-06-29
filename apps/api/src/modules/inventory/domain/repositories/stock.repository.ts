import { Stock } from "../entities/stock.entity";

export interface StockRepository {
  findByProductId(productId: string): Promise<Stock | null>;
  findByProductAndVariant(
    productId: string,
    variantId?: string | null
  ): Promise<Stock | null>;
  save(stock: Stock): Promise<void>;
}
