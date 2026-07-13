import { DomainError } from "../errors/domain-error";

export class RequiredText {
  private constructor(public readonly value: string) {}

  static create(value: string, field: string) {
    const normalized = value.trim();

    if (!normalized) {
      throw new DomainError(`${field} e obrigatorio.`);
    }

    return new RequiredText(normalized);
  }
}
