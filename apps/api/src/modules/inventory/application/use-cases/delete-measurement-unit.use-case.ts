import { DomainError } from "../../../shared/domain/errors/domain-error";
import { MeasurementUnitRepository } from "../../domain/repositories/measurement-unit.repository";

export type DeleteMeasurementUnitInput = { unitId: string };
export type DeleteMeasurementUnitOutput = { deleted: true };

export class DeleteMeasurementUnitUseCase {
  constructor(private readonly units: MeasurementUnitRepository) {}

  async execute(input: DeleteMeasurementUnitInput): Promise<DeleteMeasurementUnitOutput> {
    const unit = await this.units.findById(input.unitId);
    if (!unit) throw new DomainError("Unidade de medida nao encontrada.");

    if ((await this.units.countStocks(unit.id)) > 0) {
      throw new DomainError("Unidade de medida em uso e nao pode ser excluida. Desative-a.");
    }

    await this.units.delete(unit.id);

    return { deleted: true };
  }
}
