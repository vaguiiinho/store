import { Address } from "./address.entity";
import { Customer } from "./customer.entity";
import { OrderItem } from "./order-item.entity";
import { Payment } from "./payment.entity";

export enum OrderStatus {
  CREATED = "CREATED",
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  PAID = "PAID",
  PREPARING = "PREPARING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

export type OrderProps = {
  id: string;
  number: string;
  customerId?: string | null;
  shippingAddress: Address;
  items?: OrderItem[];
  subtotalCents?: number;
  shippingCents?: number;
  status?: OrderStatus;
  payment?: Payment | null;
  customer?: Customer | null;
  createdAt?: Date;
};

export class Order {
  constructor(
    public readonly id: string,
    public number: string,
    public readonly shippingAddress: Address,
    public customerId: string | null = null,
    public items: OrderItem[] = [],
    public subtotalCents = 0,
    public shippingCents = 0,
    public status: OrderStatus = OrderStatus.CREATED,
    public payment: Payment | null = null,
    public customer: Customer | null = null,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(props: OrderProps) {
    const order = new Order(
      props.id,
      props.number,
      props.shippingAddress,
      props.customerId ?? null,
      props.items ?? [],
      props.subtotalCents ?? 0,
      props.shippingCents ?? 0,
      props.status ?? OrderStatus.CREATED,
      props.payment ?? null,
      props.customer ?? null,
      props.createdAt ?? new Date()
    );

    order.recalculateTotals();
    return order;
  }

  addItem(item: OrderItem) {
    this.items.push(item);
    this.recalculateTotals();
  }

  recalculateTotals() {
    this.subtotalCents = this.items.reduce(
      (sum, item) => sum + item.totalCents,
      0
    );
  }

  get totalCents() {
    return this.subtotalCents + this.shippingCents;
  }

  markAwaitingPayment() {
    this.status = OrderStatus.AWAITING_PAYMENT;
  }

  markPaid() {
    this.status = OrderStatus.PAID;
  }
}
