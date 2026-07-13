import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { STOCK_REPOSITORY } from "../../inventory/inventory.tokens";
import { StockRepository } from "../../inventory/domain/repositories/stock.repository";
import { ORDER_REPOSITORY } from "../orders.tokens";
import { OrderRepository } from "../domain/repositories/order.repository";

const CHECK_INTERVAL_MS = 60_000;

@Injectable()
export class ExpireStockReservationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExpireStockReservationsService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    @Inject(STOCK_REPOSITORY) private readonly stockRepository: StockRepository,
    private readonly prisma: PrismaService
  ) {}

  async onModuleInit() {
    await this.expireReservations();
    this.timer = setInterval(() => void this.expireReservations(), CHECK_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async expireReservations(now = new Date()) {
    if (this.running) return 0;
    this.running = true;

    try {
      const orders = await this.orderRepository.findExpiredAwaitingPayment(now);

      for (const order of orders) {
        await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          for (const item of order.items) {
            await this.stockRepository.release(item.productId, item.variantId, item.quantity, tx);
          }
          order.cancel();
          await this.orderRepository.save(order, tx);
        });
      }

      return orders.length;
    } catch (error) {
      this.logger.error("Falha ao expirar reservas de estoque.", error instanceof Error ? error.stack : undefined);
      return 0;
    } finally {
      this.running = false;
    }
  }
}
