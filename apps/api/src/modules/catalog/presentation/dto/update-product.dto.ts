import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

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
}
