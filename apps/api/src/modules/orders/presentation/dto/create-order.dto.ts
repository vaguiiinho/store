import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from "class-validator";
import { PaymentMethod } from "../../domain/entities/payment.entity";
import type { ShippingRegion } from "../../application/create-order.use-case";

const ShippingRegionValues = {
  capital: "capital",
  interior: "interior",
  litoral: "litoral"
} as const;

class CreateOrderCustomerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  @IsString()
  document?: string;
}

class CreateOrderAddressDto {
  @IsString()
  @IsNotEmpty()
  cep!: string;

  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  number!: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsString()
  @IsNotEmpty()
  district!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productSlug!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  variantId?: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CreateOrderCustomerDto)
  customer!: CreateOrderCustomerDto;

  @ValidateNested()
  @Type(() => CreateOrderAddressDto)
  shippingAddress!: CreateOrderAddressDto;

  @IsEnum(ShippingRegionValues)
  shippingRegion!: ShippingRegion;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
