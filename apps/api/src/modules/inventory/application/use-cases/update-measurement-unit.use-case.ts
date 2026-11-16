import { DomainError } from "../../../shared/domain/errors/domain-error";
import { MeasurementUnitRepository } from "../../domain/repositories/measurement-unit.repository";
import { toUnitOutput, UnitOutput } from "../unit.output";

export type UpdateMeasurementUnitInput = { unitId: string; name: string; abbreviation: string; active: boolean };
export type UpdateMeasurementUnitOutput = UnitOutput;

export class UpdateMeasurementUnitUseCase {
  constructor(private readonly units: MeasurementUnitRepository) {}

  async execute(input: UpdateMeasurementUnitInput): Promise<UpdateMeasurementUnitOutput> {
    const unit = await this.units.findById(input.unitId);
    if (!unit) throw new DomainError("Unidade de medida nao encontrada.");

    unit.rename(input.name, input.abbreviation);

    const existing = await this.units.findByAbbreviation(unit.abbreviation);
    if (existing && existing.id !== unit.id) {
      throw new DomainError("Ja existe uma unidade com esta sigla.");
    }

    if (input.active) unit.activate();
    else unit.deactivate();

    await this.units.save(unit);

    return toUnitOutput(unit);
  }
}
