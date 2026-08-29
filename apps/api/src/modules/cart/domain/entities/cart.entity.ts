import { CartItem } from "./cart-item.entity";
import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";
import { Money } from "../../../shared/domain/value-objects/money.value-object";

export type CartProps = {
  id?: string;
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
      EntityId.create(props.id, "ID do carrinho").value,
      props.customerId ? EntityId.create(props.customerId, "ID do cliente").value : null,
      props.items ?? [],
      Money.create(props.shippingCents ?? 0, "Frete").cents
    );
  }

  addItem(item: CartItem) {
    const existing = this.items.find(
      (current) =>
        current.productId === item.productId &&
        current.variantId === item.variantId
    );

    if (existing) {
      existing.changeQuantity(existing.quantity + item.quantity);
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

    if (quantity <= 0) {
      this.removeItem(productId, variantId);
      return;
    }

    item.changeQuantity(quantity);
  }

  get subtotalCents() {
    return this.items.reduce((sum, item) => sum + item.totalCents, 0);
  }

  get totalCents() {
    return this.subtotalCents + this.shippingCents;
  }
}
