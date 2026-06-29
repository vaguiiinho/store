import { Inject, Injectable } from "@nestjs/common";
import { ORDER_REPOSITORY } from "../../orders/orders.tokens";
import { OrderRepository } from "../../orders/domain/repositories/order.repository";
import { OrderStatus } from "../../orders/domain/entities/order.entity";
import { PaymentStatus } from "../../orders/domain/entities/payment.entity";

export type HandlePaymentWebhookInput = {
  gatewayReference: string;
  externalReference: string | null;
  status: PaymentStatus;
};

@Injectable()
export class HandlePaymentWebhookUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository
  ) {}

  async execute(input: HandlePaymentWebhookInput) {
    const order = await this.orderRepository.findByPaymentGatewayReference(input.gatewayReference);

    if (!order || !order.payment) {
      return null;
    }

    order.payment.gatewayReference = input.gatewayReference;
    order.payment.externalReference = input.externalReference ?? order.payment.externalReference;
    order.payment.status = input.status;

    if (input.status === PaymentStatus.PAID) {
      order.markPaid();
      order.payment.markPaid();
    } else if (input.status === PaymentStatus.DECLINED || input.status === PaymentStatus.CANCELLED) {
      order.status = OrderStatus.CANCELLED;
      order.payment.status = input.status;
    } else {
      order.markAwaitingPayment();
    }

    await this.orderRepository.save(order);

    return order;
  }
}
