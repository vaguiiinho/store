import { DomainError } from "../../../shared/domain/errors/domain-error";
import { MeasurementUnit } from "../../domain/entities/measurement-unit.entity";
import { MeasurementUnitRepository } from "../../domain/repositories/measurement-unit.repository";
import { toUnitOutput, UnitOutput } from "../unit.output";

export type CreateMeasurementUnitInput = { name: string; abbreviation: string };
export type CreateMeasurementUnitOutput = UnitOutput;

export class CreateMeasurementUnitUseCase {
  constructor(private readonly units: MeasurementUnitRepository) {}

  async execute(input: CreateMeasurementUnitInput): Promise<CreateMeasurementUnitOutput> {
    const unit = MeasurementUnit.create({ name: input.name, abbreviation: input.abbreviation });

    if (await this.units.findByAbbreviation(unit.abbreviation)) {
      throw new DomainError("Ja existe uma unidade com esta sigla.");
    }

    await this.units.save(unit);

    return toUnitOutput(unit);
  }
}
