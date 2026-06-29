import { CartItem } from "./cart-item.entity";

export type CartProps = {
  id: string;
  customerId?: string | null;
  items?: CartItem[];
  shippingCents?: number;
};

export class Cart {
  constructor(
    public readonly id: string,
    public readonly customerId: string | null = null,
    public items: CartItem[] = [],
    public shippingCents = 0
  ) {}

  static create(props: CartProps) {
    return new Cart(
      props.id,
      props.customerId ?? null,
      props.items ?? [],
      props.shippingCents ?? 0
    );
  }

  addItem(item: CartItem) {
    const existing = this.items.find(
      (current) =>
        current.productId === item.productId &&
        current.variantId === item.variantId
    );

    if (existing) {
      existing.quantity += item.quantity;
      existing.unitPriceCents = item.unitPriceCents;
      return;
    }

    this.items.push(item);
  }

  removeItem(productId: string, variantId?: string | null) {
    this.items = this.items.filter(
      (item) =>
        item.productId !== productId || item.variantId !== (variantId ?? null)
    );
  }

  updateQuantity(productId: string, quantity: number, variantId?: string | null) {
    const item = this.items.find(
      (current) =>
        current.productId === productId &&
        current.variantId === (variantId ?? null)
    );

    if (!item) {
      return;
    }

    item.quantity = quantity;
  }

  get subtotalCents() {
    return this.items.reduce((sum, item) => sum + item.totalCents, 0);
  }

  get totalCents() {
    return this.subtotalCents + this.shippingCents;
  }
}
