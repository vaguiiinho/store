import { IsBoolean, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;
}

export class UpdateCategoryDto extends CreateCategoryDto {
  @IsBoolean()
  active!: boolean;
}
