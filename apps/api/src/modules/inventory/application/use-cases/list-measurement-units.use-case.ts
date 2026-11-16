import { MeasurementUnitRepository } from "../../domain/repositories/measurement-unit.repository";
import { toUnitOutput, UnitOutput } from "../unit.output";

export type ListMeasurementUnitsInput = Record<string, never>;
export type ListMeasurementUnitsOutput = Array<UnitOutput & { stockCount: number }>;

export class ListMeasurementUnitsUseCase {
  constructor(private readonly units: MeasurementUnitRepository) {}

  async execute(_input: ListMeasurementUnitsInput = {}): Promise<ListMeasurementUnitsOutput> {
    const [all, counts] = await Promise.all([this.units.findAll(), this.units.countStocksByUnit()]);

    return all
      .map((unit) => ({ ...toUnitOutput(unit), stockCount: counts[unit.id] ?? 0 }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
