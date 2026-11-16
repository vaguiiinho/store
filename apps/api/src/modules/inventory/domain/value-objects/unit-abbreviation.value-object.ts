import { DomainError } from "../../../shared/domain/errors/domain-error";

const PATTERN = /^[\p{L}\p{N}.,/%°²³-]+$/u;
const MAX_LENGTH = 8;

export class UnitAbbreviation {
  private constructor(public readonly value: string) {}

  static create(value: string) {
    const normalized = value.trim();

    if (!normalized || normalized.length > MAX_LENGTH || !PATTERN.test(normalized)) {
      throw new DomainError("Sigla da unidade invalida.");
    }

    return new UnitAbbreviation(normalized);
  }

  equals(other: UnitAbbreviation) {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
