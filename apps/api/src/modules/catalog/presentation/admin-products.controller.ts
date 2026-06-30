import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Patch,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { AdminAuthService } from "../../admin-auth/admin-auth.service";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { CreateProductUseCase } from "../application/create-product.use-case";
import { GetAdminProductUseCase } from "../application/get-admin-product.use-case";
import { ListAdminProductsUseCase } from "../application/list-admin-products.use-case";
import { UpdateProductUseCase } from "../application/update-product.use-case";
import { UpdateProductStatusUseCase } from "../application/update-product-status.use-case";
import { ListCategoriesUseCase } from "../application/list-categories.use-case";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
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
    private readonly getAdminProductUseCase: GetAdminProductUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
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

  @Post("admin/products")
  async createProduct(
    @Body() body: CreateProductDto,
    @Headers("cookie") cookieHeader?: string
  ) {
    const session = this.adminAuthService.verifyCookie(cookieHeader);

    if (!session) {
      throw new UnauthorizedException("Autenticacao de admin necessaria.");
    }

    try {
      const product = await this.createProductUseCase.execute({
        name: body.name,
        slug: body.slug,
        description: body.description,
        priceCents: body.priceCents,
        images: body.images,
        categoryIds: body.categoryIds,
        variantName: body.variantName ?? null,
        variantValue: body.variantValue ?? null,
        variantSku: body.variantSku ?? null,
        availableQuantity: body.availableQuantity ?? 0,
        reservedQuantity: body.reservedQuantity ?? 0
      });

      return serializeProduct(product);
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Get("admin/products/:id")
  async getAdminProduct(@Param("id") id: string, @Headers("cookie") cookieHeader?: string) {
    const session = this.adminAuthService.verifyCookie(cookieHeader);

    if (!session) {
      throw new UnauthorizedException("Autenticacao de admin necessaria.");
    }

    const product = await this.getAdminProductUseCase.execute(id);

    if (!product) {
      throw new NotFoundException("Produto nao encontrado.");
    }

    const categories = await this.listCategoriesUseCase.execute(false);

    return {
      product: serializeProduct(product),
      categories: categories.map(serializeCategory)
    };
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

  @Patch("admin/products/:id")
  async updateProduct(
    @Param("id") id: string,
    @Body() body: UpdateProductDto,
    @Headers("cookie") cookieHeader?: string
  ) {
    const session = this.adminAuthService.verifyCookie(cookieHeader);

    if (!session) {
      throw new UnauthorizedException("Autenticacao de admin necessaria.");
    }

    try {
      const product = await this.updateProductUseCase.execute({
        productId: id,
        name: body.name,
        slug: body.slug,
        description: body.description,
        priceCents: body.priceCents,
        images: body.images,
        categoryIds: body.categoryIds,
        variantName: body.variantName ?? null,
        variantValue: body.variantValue ?? null,
        variantSku: body.variantSku ?? null,
        availableQuantity: body.availableQuantity ?? 0,
        reservedQuantity: body.reservedQuantity ?? 0
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
