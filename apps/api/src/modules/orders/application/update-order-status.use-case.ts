import { Inject, Injectable } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { ORDER_REPOSITORY } from "../orders.tokens";
import { OrderRepository } from "../domain/repositories/order.repository";
import { OrderStatus } from "../domain/entities/order.entity";

export type UpdateOrderStatusInput = {
  orderId: string;
  status: OrderStatus;
};

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository
  ) {}

  async execute(input: UpdateOrderStatusInput) {
    const order = await this.orderRepository.findById(input.orderId);

    if (!order) {
      throw new DomainError("Pedido nao encontrado.");
    }

    order.changeStatus(input.status);

    await this.orderRepository.save(order);

    return order;
  }
}
