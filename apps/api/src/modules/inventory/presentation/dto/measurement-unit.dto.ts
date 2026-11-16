import { IsBoolean, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateMeasurementUnitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  @IsString()
  @IsNotEmpty()
  abbreviation!: string;
}

export class UpdateMeasurementUnitDto extends CreateMeasurementUnitDto {
  @IsBoolean()
  active!: boolean;
}

export class ChangeStockUnitDto {
  @IsUUID("4")
  unitId!: string;
}
