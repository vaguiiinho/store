export type OrderItemProps = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  variantId?: string | null;
};

export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly productName: string,
    public quantity: number,
    public unitPriceCents: number,
    public readonly variantId: string | null = null
  ) {}

  static create(props: OrderItemProps) {
    return new OrderItem(
      props.id,
      props.productId,
      props.productName,
      props.quantity,
      props.unitPriceCents,
      props.variantId ?? null
    );
  }

  get totalCents() {
    return this.quantity * this.unitPriceCents;
  }
}
