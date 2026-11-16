import { MeasurementUnit } from "../domain/entities/measurement-unit.entity";

export type UnitOutput = { id: string; name: string; abbreviation: string; active: boolean };

export function toUnitOutput(unit: MeasurementUnit): UnitOutput {
  return { id: unit.id, name: unit.name, abbreviation: unit.abbreviation, active: unit.active };
}
