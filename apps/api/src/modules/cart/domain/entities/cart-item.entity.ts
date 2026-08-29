import { DomainError } from "../../../shared/domain/errors/domain-error";
import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";
import { Money } from "../../../shared/domain/value-objects/money.value-object";

export type CartItemProps = {
  id?: string;
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

    return new CartItem(
      EntityId.create(props.id, "ID do item do carrinho").value,
      EntityId.create(props.productId, "ID do produto").value,
      props.variantId ? EntityId.create(props.variantId, "ID da variacao").value : null,
      props.quantity,
      Money.create(props.unitPriceCents, "Preco unitario").cents
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
