import { DomainError } from "../../../shared/domain/errors/domain-error";
import { MeasurementUnitRepository } from "../../domain/repositories/measurement-unit.repository";
import { StockRepository } from "../../domain/repositories/stock.repository";
import { toUnitOutput, UnitOutput } from "../unit.output";

export type ChangeStockUnitInput = { productId: string; unitId: string };
export type ChangeStockUnitOutput = { productId: string; stockId: string; unit: UnitOutput };

export class ChangeStockUnitUseCase {
  constructor(
    private readonly stocks: StockRepository,
    private readonly units: MeasurementUnitRepository
  ) {}

  async execute(input: ChangeStockUnitInput): Promise<ChangeStockUnitOutput> {
    const stock = await this.stocks.findByProductId(input.productId);
    if (!stock) throw new DomainError("Estoque nao encontrado.");

    const unit = await this.units.findById(input.unitId);
    if (!unit) throw new DomainError("Unidade de medida nao encontrada.");

    stock.changeUnit(unit);
    await this.stocks.changeUnit(stock.id, stock.unit.id);

    return { productId: stock.productId, stockId: stock.id, unit: toUnitOutput(stock.unit) };
  }
}
