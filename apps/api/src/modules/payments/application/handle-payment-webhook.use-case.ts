import { Prisma } from "@prisma/client";
import { Inject, Injectable } from "@nestjs/common";
import { ORDER_REPOSITORY } from "../../orders/orders.tokens";
import { OrderRepository } from "../../orders/domain/repositories/order.repository";
import { OrderStatus } from "../../orders/domain/entities/order.entity";
import { PaymentStatus } from "../../orders/domain/entities/payment.entity";
import { STOCK_REPOSITORY } from "../../inventory/inventory.tokens";
import { StockRepository } from "../../inventory/domain/repositories/stock.repository";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { Order } from "../../orders/domain/entities/order.entity";

export type HandlePaymentWebhookInput = {
  gatewayReference: string;
  externalReference: string | null;
  status: PaymentStatus;
};
export type HandlePaymentWebhookOutput = Order | null;

@Injectable()
export class HandlePaymentWebhookUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: StockRepository,
    private readonly prisma: PrismaService
  ) {}

  async execute(input: HandlePaymentWebhookInput): Promise<HandlePaymentWebhookOutput> {
    const order = await this.orderRepository.findByPaymentGatewayReference(input.gatewayReference);

    if (!order || !order.payment) {
      return null;
    }

    const payment = order.payment;

    payment.gatewayReference = input.gatewayReference;
    payment.externalReference = input.externalReference ?? payment.externalReference;
    payment.status = input.status;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (input.status === PaymentStatus.PAID) {
        order.markPaid();
        payment.markPaid();
      } else if (input.status === PaymentStatus.DECLINED || input.status === PaymentStatus.CANCELLED) {
        if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.CANCELLED) {
          await this.releaseReservedStocks(order, tx);
        }

        order.cancel();
        payment.status = input.status;
      } else {
        order.markAwaitingPayment();
      }

      await this.orderRepository.save(order, tx);
    });

    return order;
  }

  private async releaseReservedStocks(
    order: Awaited<ReturnType<OrderRepository["findByPaymentGatewayReference"]>>,
    tx: Prisma.TransactionClient
  ) {
    if (!order) {
      return;
    }

    for (const item of order.items) {
      await this.stockRepository.release(item.productId, item.variantId, item.quantity, tx);
    }
  }
}
