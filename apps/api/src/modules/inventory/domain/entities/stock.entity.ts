import { DomainError } from "../../../shared/domain/errors/domain-error";
import { NonNegativeQuantity } from "../../../shared/domain/value-objects/non-negative-quantity.value-object";
import { MeasurementUnit } from "./measurement-unit.entity";
import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";

export type StockProps = {
  id?: string;
  productId: string;
  variantId?: string | null;
  availableQuantity?: number;
  reservedQuantity?: number;
  unit: MeasurementUnit;
};

export class Stock {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly variantId: string | null = null,
    private availableQuantity = 0,
    private reservedQuantity = 0,
    public unit: MeasurementUnit
  ) {}

  static create(props: StockProps) {
    const availableQuantity = NonNegativeQuantity.create(props.availableQuantity ?? 0, "Estoque disponivel");
    const reservedQuantity = NonNegativeQuantity.create(props.reservedQuantity ?? 0, "Estoque reservado");

    return new Stock(
      EntityId.create(props.id, "ID do estoque").value,
      EntityId.create(props.productId, "ID do produto do estoque").value,
      props.variantId ? EntityId.create(props.variantId, "ID da variacao do estoque").value : null,
      availableQuantity.value,
      reservedQuantity.value,
      props.unit
    );
  }

  /** Estoque novo (0/0): a unidade precisa estar ativa. */
  static open(props: { id?: string; productId: string; unit: MeasurementUnit }) {
    props.unit.ensureAssignable();
    return Stock.create({ id: props.id, productId: props.productId, unit: props.unit });
  }

  changeUnit(unit: MeasurementUnit) {
    if (unit.id === this.unit.id) {
      return;
    }

    unit.ensureAssignable();
    this.unit = unit;
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
