import { Module } from "@nestjs/common";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { ChangeStockUnitUseCase } from "./application/use-cases/change-stock-unit.use-case";
import { CreateMeasurementUnitUseCase } from "./application/use-cases/create-measurement-unit.use-case";
import { DeleteMeasurementUnitUseCase } from "./application/use-cases/delete-measurement-unit.use-case";
import { ListMeasurementUnitsUseCase } from "./application/use-cases/list-measurement-units.use-case";
import { UpdateMeasurementUnitUseCase } from "./application/use-cases/update-measurement-unit.use-case";
import { MeasurementUnitRepository } from "./domain/repositories/measurement-unit.repository";
import { StockRepository } from "./domain/repositories/stock.repository";
import { PrismaMeasurementUnitRepository } from "./infrastructure/prisma/prisma-measurement-unit.repository";
import { PrismaStockRepository } from "./infrastructure/prisma/prisma-stock.repository";
import { MEASUREMENT_UNIT_REPOSITORY, STOCK_REPOSITORY } from "./inventory.tokens";
import { AdminMeasurementUnitsController } from "./presentation/admin-measurement-units.controller";

@Module({
  imports: [PrismaModule],
  controllers: [AdminMeasurementUnitsController],
  providers: [
    { provide: STOCK_REPOSITORY, useClass: PrismaStockRepository },
    { provide: MEASUREMENT_UNIT_REPOSITORY, useClass: PrismaMeasurementUnitRepository },
    {
      provide: ListMeasurementUnitsUseCase,
      useFactory: (units: MeasurementUnitRepository) => new ListMeasurementUnitsUseCase(units),
      inject: [MEASUREMENT_UNIT_REPOSITORY]
    },
    {
      provide: CreateMeasurementUnitUseCase,
      useFactory: (units: MeasurementUnitRepository) => new CreateMeasurementUnitUseCase(units),
      inject: [MEASUREMENT_UNIT_REPOSITORY]
    },
    {
      provide: UpdateMeasurementUnitUseCase,
      useFactory: (units: MeasurementUnitRepository) => new UpdateMeasurementUnitUseCase(units),
      inject: [MEASUREMENT_UNIT_REPOSITORY]
    },
    {
      provide: DeleteMeasurementUnitUseCase,
      useFactory: (units: MeasurementUnitRepository) => new DeleteMeasurementUnitUseCase(units),
      inject: [MEASUREMENT_UNIT_REPOSITORY]
    },
    {
      provide: ChangeStockUnitUseCase,
      useFactory: (stocks: StockRepository, units: MeasurementUnitRepository) => new ChangeStockUnitUseCase(stocks, units),
      inject: [STOCK_REPOSITORY, MEASUREMENT_UNIT_REPOSITORY]
    }
  ],
  exports: [STOCK_REPOSITORY, MEASUREMENT_UNIT_REPOSITORY]
})
export class InventoryModule {}
