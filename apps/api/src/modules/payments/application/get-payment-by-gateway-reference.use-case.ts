import { Inject, Injectable } from "@nestjs/common";
import { ORDER_REPOSITORY } from "../../orders/orders.tokens";
import { OrderRepository } from "../../orders/domain/repositories/order.repository";
import { DomainError } from "../../shared/domain/errors/domain-error";

@Injectable()
export class GetPaymentByGatewayReferenceUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository
  ) {}

  async execute(gatewayReference: string) {
    const order = await this.orderRepository.findByPaymentGatewayReference(gatewayReference);

    if (!order || !order.payment) {
      throw new DomainError("Pagamento nao encontrado.");
    }

    return {
      order,
      payment: order.payment
    };
  }
}
