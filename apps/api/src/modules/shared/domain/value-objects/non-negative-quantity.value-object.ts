import { DomainError } from "../errors/domain-error";

export class NonNegativeQuantity {
  private constructor(public readonly value: number) {}

  static create(value: number, field = "Quantidade") {
    if (!Number.isInteger(value) || value < 0) {
      throw new DomainError(`${field} deve ser um numero inteiro maior ou igual a zero.`);
    }

    return new NonNegativeQuantity(value);
  }
}
