import { DomainError } from "../errors/domain-error";

export class Money {
  private constructor(public readonly cents: number) {}

  static create(cents: number, field = "Valor") {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new DomainError(`${field} deve ser informado em centavos e nao pode ser negativo.`);
    }

    return new Money(cents);
  }

  multiply(quantity: number) {
    return Money.create(this.cents * quantity, "Total");
  }
}
