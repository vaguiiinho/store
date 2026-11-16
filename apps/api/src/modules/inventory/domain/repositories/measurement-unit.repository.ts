import { MeasurementUnit } from "../entities/measurement-unit.entity";

export interface MeasurementUnitRepository {
  findById(id: string): Promise<MeasurementUnit | null>;
  /** Sem diferenciar maiusculas de minusculas. */
  findByAbbreviation(abbreviation: string): Promise<MeasurementUnit | null>;
  findAll(): Promise<MeasurementUnit[]>;
  save(unit: MeasurementUnit): Promise<void>;
  delete(id: string): Promise<void>;
  countStocks(id: string): Promise<number>;
  countStocksByUnit(): Promise<Record<string, number>>;
}
