import { Prisma } from "@prisma/client";
import { Stock } from "../entities/stock.entity";

export interface StockRepository {
  findByProductId(productId: string): Promise<Stock | null>;
  findByProductAndVariant(
    productId: string,
    variantId?: string | null
  ): Promise<Stock | null>;
  reserve(
    productId: string,
    variantId: string | null,
    quantity: number,
    tx?: Prisma.TransactionClient
  ): Promise<Stock>;
  release(
    productId: string,
    variantId: string | null,
    quantity: number,
    tx?: Prisma.TransactionClient
  ): Promise<Stock>;
  save(stock: Stock, tx?: Prisma.TransactionClient): Promise<void>;
  /** Atualiza somente `unitId` (evita lost update das quantidades). */
  changeUnit(stockId: string, unitId: string): Promise<void>;
  adjustAvailable(productId: string, variantId: string | null, delta: number): Promise<Stock>;
}
