import { DomainError } from "../../../shared/domain/errors/domain-error";
import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";
import { ShortName } from "../../../shared/domain/value-objects/short-name.value-object";
import { UnitAbbreviation } from "../value-objects/unit-abbreviation.value-object";

export type MeasurementUnitProps = {
  id?: string;
  name: string;
  abbreviation: string;
  active?: boolean;
};

export class MeasurementUnit {
  constructor(
    public readonly id: string,
    public name: string,
    public abbreviation: string,
    public active = true
  ) {}

  static create(props: MeasurementUnitProps) {
    return new MeasurementUnit(
      EntityId.create(props.id, "ID da unidade de medida").value,
      ShortName.create(props.name, "Nome da unidade").value,
      UnitAbbreviation.create(props.abbreviation).value,
      props.active ?? true
    );
  }

  rename(name: string, abbreviation: string) {
    this.name = ShortName.create(name, "Nome da unidade").value;
    this.abbreviation = UnitAbbreviation.create(abbreviation).value;
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  ensureAssignable() {
    if (!this.active) {
      throw new DomainError("Unidade de medida inativa.");
    }
  }
}
