import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsInt()
  @Min(1)
  priceCents!: number;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  categoryIds!: string[];

  @IsOptional()
  @IsString()
  variantName?: string;

  @IsOptional()
  @IsString()
  variantValue?: string;

  @IsOptional()
  @IsString()
  variantSku?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  availableQuantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reservedQuantity?: number;
}
