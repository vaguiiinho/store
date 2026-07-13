import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { STOCK_REPOSITORY } from "../../inventory/inventory.tokens";
import { StockRepository } from "../../inventory/domain/repositories/stock.repository";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { ORDER_REPOSITORY } from "../orders.tokens";
import { OrderRepository } from "../domain/repositories/order.repository";
import { OrderStatus } from "../domain/entities/order.entity";

@Injectable()
export class DeleteOrderUseCase {
  constructor(@Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository, @Inject(STOCK_REPOSITORY) private readonly stock: StockRepository, private readonly prisma: PrismaService) {}
  async execute(orderId: string) {
    const order = await this.orders.findById(orderId);
    if (!order) throw new DomainError("Pedido nao encontrado.");
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (order.status !== OrderStatus.CANCELLED) {
        for (const item of order.items) await this.stock.release(item.productId, item.variantId, item.quantity, tx);
      }
      await this.orders.delete(order.id, tx);
    });
  }
}
