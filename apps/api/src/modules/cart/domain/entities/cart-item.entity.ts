export type CartItemProps = {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPriceCents: number;
};

export class CartItem {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly variantId: string | null,
    public quantity: number,
    public unitPriceCents: number
  ) {}

  static create(props: CartItemProps) {
    return new CartItem(
      props.id,
      props.productId,
      props.variantId ?? null,
      props.quantity,
      props.unitPriceCents
    );
  }

  get totalCents() {
    return this.quantity * this.unitPriceCents;
  }
}
