import { IsEnum } from "class-validator";
import { OrderStatus } from "../../domain/entities/order.entity";

const OrderStatusValues = {
  created: OrderStatus.CREATED,
  awaiting_payment: OrderStatus.AWAITING_PAYMENT,
  paid: OrderStatus.PAID,
  preparing: OrderStatus.PREPARING,
  shipped: OrderStatus.SHIPPED,
  delivered: OrderStatus.DELIVERED,
  cancelled: OrderStatus.CANCELLED
} as const;

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatusValues)
  status!: OrderStatus;
}
