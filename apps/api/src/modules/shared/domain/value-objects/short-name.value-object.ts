import { DomainError } from "../errors/domain-error";

const MAX_LENGTH = 60;

export class ShortName {
  private constructor(public readonly value: string) {}

  static create(value: string, field = "Nome") {
    const normalized = value.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new DomainError(`${field} e obrigatorio.`);
    }

    if (normalized.length > MAX_LENGTH) {
      throw new DomainError(`${field} deve ter no maximo ${MAX_LENGTH} caracteres.`);
    }

    return new ShortName(normalized);
  }

  equals(other: ShortName) {
    return this.value === other.value;
  }
}
