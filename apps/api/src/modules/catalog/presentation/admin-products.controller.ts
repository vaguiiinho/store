import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, UnauthorizedException } from "@nestjs/common";
import { AdminAuthService } from "../../admin-auth/admin-auth.service";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { ListAdminProductsUseCase } from "../application/list-admin-products.use-case";
import { UpdateProductStatusUseCase } from "../application/update-product-status.use-case";
import { UpdateProductStatusDto } from "./dto/update-product-status.dto";

function serializeCategory(category: { id: string; name: string; slug: string }) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug
  };
}

function serializeVariant(variant: {
  id: string;
  name: string;
  value: string;
  sku: string | null;
  active: boolean;
}) {
  return {
    id: variant.id,
    name: variant.name,
    value: variant.value,
    sku: variant.sku,
    active: variant.active
  };
}

function serializeStock(stock: {
  id: string;
  available: number;
  reserved: number;
} | null) {
  if (!stock) {
    return null;
  }

  return {
    id: stock.id,
    availableQuantity: stock.available,
    reservedQuantity: stock.reserved
  };
}

function serializeProduct(product: {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images: string[];
  active: boolean;
  categories: Array<{ id: string; name: string; slug: string }>;
  variants: Array<{
    id: string;
    name: string;
    value: string;
    sku: string | null;
    active: boolean;
  }>;
  stock: {
    id: string;
    available: number;
    reserved: number;
  } | null;
}) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceCents: product.priceCents,
    images: product.images,
    active: product.active,
    categories: product.categories.map(serializeCategory),
    variants: product.variants.map(serializeVariant),
    stock: serializeStock(product.stock)
  };
}

@Controller()
export class AdminProductsController {
  constructor(
    private readonly listAdminProductsUseCase: ListAdminProductsUseCase,
    private readonly updateProductStatusUseCase: UpdateProductStatusUseCase,
    private readonly adminAuthService: AdminAuthService
  ) {}

  @Get("admin/products")
  async listAdminProducts(@Headers("cookie") cookieHeader?: string) {
    const session = this.adminAuthService.verifyCookie(cookieHeader);

    if (!session) {
      throw new UnauthorizedException("Autenticacao de admin necessaria.");
    }

    const products = await this.listAdminProductsUseCase.execute();

    return products.map(serializeProduct);
  }

  @Patch("admin/products/:id/status")
  async updateProductStatus(
    @Param("id") id: string,
    @Body() body: UpdateProductStatusDto,
    @Headers("cookie") cookieHeader?: string
  ) {
    const session = this.adminAuthService.verifyCookie(cookieHeader);

    if (!session) {
      throw new UnauthorizedException("Autenticacao de admin necessaria.");
    }

    try {
      const product = await this.updateProductStatusUseCase.execute({
        productId: id,
        active: body.active
      });

      return serializeProduct(product);
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
