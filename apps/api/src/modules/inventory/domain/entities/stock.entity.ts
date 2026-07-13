import { DomainError } from "../../../shared/domain/errors/domain-error";
import { NonNegativeQuantity } from "../../../shared/domain/value-objects/non-negative-quantity.value-object";

export type StockProps = {
  id: string;
  productId: string;
  variantId?: string | null;
  availableQuantity?: number;
  reservedQuantity?: number;
};

export class Stock {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly variantId: string | null = null,
    private availableQuantity = 0,
    private reservedQuantity = 0
  ) {}

  static create(props: StockProps) {
    const availableQuantity = NonNegativeQuantity.create(props.availableQuantity ?? 0, "Estoque disponivel");
    const reservedQuantity = NonNegativeQuantity.create(props.reservedQuantity ?? 0, "Estoque reservado");

    return new Stock(
      props.id,
      props.productId,
      props.variantId ?? null,
      availableQuantity.value,
      reservedQuantity.value
    );
  }

  get available() {
    return this.availableQuantity;
  }

  get reserved() {
    return this.reservedQuantity;
  }

  reserve(quantity: number) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainError("Quantidade de reserva deve ser maior que zero.");
    }

    if (this.availableQuantity < quantity) {
      throw new DomainError("Estoque insuficiente para reserva.");
    }

    this.availableQuantity -= quantity;
    this.reservedQuantity += quantity;
  }

  release(quantity: number) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainError("Quantidade de liberacao deve ser maior que zero.");
    }

    if (this.reservedQuantity < quantity) {
      throw new DomainError("Nao ha estoque reservado suficiente.");
    }

    this.availableQuantity += quantity;
    this.reservedQuantity -= quantity;
  }

  adjustAvailable(delta: number) {
    if (!Number.isInteger(delta) || delta === 0) throw new DomainError("Ajuste de estoque deve ser um inteiro diferente de zero.");
    if (this.availableQuantity + delta < 0) throw new DomainError("Estoque insuficiente para esta retirada.");
    this.availableQuantity += delta;
  }
}
