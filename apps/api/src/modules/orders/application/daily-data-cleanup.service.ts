import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { OrderStatus } from "../domain/entities/order.entity";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_DAYS = 30;

@Injectable()
export class DailyDataCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DailyDataCleanupService.name);
  private timer: NodeJS.Timeout | null = null;
  constructor(private readonly prisma: PrismaService) {}
  async onModuleInit() { await this.clean(); this.timer = setInterval(() => void this.clean(), ONE_DAY_MS); }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async clean(now = new Date()) {
    try {
      const threshold = new Date(now.getTime() - RETENTION_DAYS * ONE_DAY_MS);
      const removed = await this.prisma.order.deleteMany({ where: { status: OrderStatus.CANCELLED, updatedAt: { lt: threshold } } });
      await this.prisma.customer.deleteMany({ where: { orders: { none: {} }, carts: { none: {} } } });
      return removed.count;
    } catch (error) { this.logger.error("Falha na limpeza diária de dados.", error instanceof Error ? error.stack : undefined); return 0; }
  }
}
