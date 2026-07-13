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
    if (!Number.isInteger(props.quantity) || props.quantity <= 0) {
      throw new DomainError("Quantidade do item deve ser maior que zero.");
    }

    if (!Number.isInteger(props.unitPriceCents) || props.unitPriceCents < 0) {
      throw new DomainError("Preco unitario invalido.");
    }
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

  changeQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainError("Quantidade do item deve ser maior que zero.");
    }

    this.quantity = quantity;
  }
}
import { DomainError } from "../../../shared/domain/errors/domain-error";
