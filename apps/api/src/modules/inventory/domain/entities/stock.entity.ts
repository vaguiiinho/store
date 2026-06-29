import { DomainError } from "../../../shared/domain/errors/domain-error";

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
    return new Stock(
      props.id,
      props.productId,
      props.variantId ?? null,
      props.availableQuantity ?? 0,
      props.reservedQuantity ?? 0
    );
  }

  get available() {
    return this.availableQuantity;
  }

  get reserved() {
    return this.reservedQuantity;
  }

  reserve(quantity: number) {
    if (quantity <= 0) {
      throw new DomainError("Quantidade de reserva deve ser maior que zero.");
    }

    if (this.availableQuantity < quantity) {
      throw new DomainError("Estoque insuficiente para reserva.");
    }

    this.availableQuantity -= quantity;
    this.reservedQuantity += quantity;
  }

  release(quantity: number) {
    if (quantity <= 0) {
      throw new DomainError("Quantidade de liberacao deve ser maior que zero.");
    }

    if (this.reservedQuantity < quantity) {
      throw new DomainError("Nao ha estoque reservado suficiente.");
    }

    this.availableQuantity += quantity;
    this.reservedQuantity -= quantity;
  }
}
