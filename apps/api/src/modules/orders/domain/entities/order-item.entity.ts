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
    if (!Number.isInteger(props.quantity) || props.quantity <= 0) {
      throw new DomainError("Quantidade do item do pedido deve ser maior que zero.");
    }

    if (!Number.isInteger(props.unitPriceCents) || props.unitPriceCents < 0) {
      throw new DomainError("Preco do item do pedido invalido.");
    }
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
import { DomainError } from "../../../shared/domain/errors/domain-error";
