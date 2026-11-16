import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { AdminOnly } from "../../auth/presentation/decorators";
import { runUseCase } from "../../shared/presentation/domain-error.http";
import { ChangeStockUnitUseCase } from "../application/use-cases/change-stock-unit.use-case";
import { CreateMeasurementUnitUseCase } from "../application/use-cases/create-measurement-unit.use-case";
import { DeleteMeasurementUnitUseCase } from "../application/use-cases/delete-measurement-unit.use-case";
import { ListMeasurementUnitsUseCase } from "../application/use-cases/list-measurement-units.use-case";
import { UpdateMeasurementUnitUseCase } from "../application/use-cases/update-measurement-unit.use-case";
import { ChangeStockUnitDto, CreateMeasurementUnitDto, UpdateMeasurementUnitDto } from "./dto/measurement-unit.dto";

const uuid = new ParseUUIDPipe({ version: "4" });

@AdminOnly()
@Controller()
export class AdminMeasurementUnitsController {
  constructor(
    private readonly listUnits: ListMeasurementUnitsUseCase,
    private readonly createUnit: CreateMeasurementUnitUseCase,
    private readonly updateUnit: UpdateMeasurementUnitUseCase,
    private readonly deleteUnit: DeleteMeasurementUnitUseCase,
    private readonly changeStockUnit: ChangeStockUnitUseCase
  ) {}

  @Get("admin/measurement-units")
  list() {
    return runUseCase(() => this.listUnits.execute({}));
  }

  @Post("admin/measurement-units")
  create(@Body() body: CreateMeasurementUnitDto) {
    return runUseCase(() => this.createUnit.execute({ name: body.name, abbreviation: body.abbreviation }));
  }

  @Patch("admin/measurement-units/:id")
  update(@Param("id", uuid) id: string, @Body() body: UpdateMeasurementUnitDto) {
    return runUseCase(() =>
      this.updateUnit.execute({ unitId: id, name: body.name, abbreviation: body.abbreviation, active: body.active })
    );
  }

  @Delete("admin/measurement-units/:id")
  remove(@Param("id", uuid) id: string) {
    return runUseCase(() => this.deleteUnit.execute({ unitId: id }));
  }

  @Patch("admin/products/:id/stock/unit")
  changeUnit(@Param("id", uuid) id: string, @Body() body: ChangeStockUnitDto) {
    return runUseCase(() => this.changeStockUnit.execute({ productId: id, unitId: body.unitId }));
  }
}
