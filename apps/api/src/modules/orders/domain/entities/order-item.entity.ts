import { DomainError } from "../../../shared/domain/errors/domain-error";
import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";
import { Money } from "../../../shared/domain/value-objects/money.value-object";
import { RequiredText } from "../../../shared/domain/value-objects/required-text.value-object";

export type OrderItemProps = {
  id?: string;
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
    if (!Number.isInteger(props.quantity) || props.quantity <= 0) {
      throw new DomainError("Quantidade do item do pedido deve ser maior que zero.");
    }

    return new OrderItem(
      EntityId.create(props.id, "ID do item do pedido").value,
      EntityId.create(props.productId, "ID do produto").value,
      RequiredText.create(props.productName, "Nome do produto").value,
      props.quantity,
      Money.create(props.unitPriceCents, "Preco do item do pedido").cents,
      props.variantId ? EntityId.create(props.variantId, "ID da variacao").value : null
    );
  }

  get totalCents() {
    return this.quantity * this.unitPriceCents;
  }
}
