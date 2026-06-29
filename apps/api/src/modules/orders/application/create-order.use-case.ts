import { Address } from "../domain/entities/address.entity";
import { Customer } from "../domain/entities/customer.entity";
import { Order, OrderStatus } from "../domain/entities/order.entity";
import { OrderItem } from "../domain/entities/order-item.entity";

export type CreateOrderItemInput = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  variantId?: string | null;
};

export type CreateOrderInput = {
  id: string;
  number: string;
  customerId?: string | null;
  customer?: Customer | null;
  shippingAddress: Address;
  items: CreateOrderItemInput[];
  shippingCents: number;
};

export class CreateOrderUseCase {
  execute(input: CreateOrderInput) {
    const order = Order.create({
      id: input.id,
      number: input.number,
      customerId: input.customerId ?? null,
      customer: input.customer ?? null,
      shippingAddress: input.shippingAddress,
      shippingCents: input.shippingCents,
      status: OrderStatus.CREATED,
      items: input.items.map((item) =>
        OrderItem.create({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          variantId: item.variantId ?? null
        })
      )
    });

    order.markAwaitingPayment();
    return order;
  }
}
