import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  NotFoundException
} from "@nestjs/common";
import { AdminOnly } from "../../auth/presentation/decorators";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { CreateProductUseCase } from "../application/use-cases/create-product.use-case";
import { GetAdminProductUseCase } from "../application/get-admin-product.use-case";
import { ListAdminProductsUseCase } from "../application/list-admin-products.use-case";
import { UpdateProductUseCase } from "../application/use-cases/update-product.use-case";
import { toAdminProductOutput } from "../application/admin-product.output";
import { toCategoryOutput } from "../application/category.output";
import { UpdateProductStatusUseCase } from "../application/update-product-status.use-case";
import { DeleteProductUseCase } from "../application/delete-product.use-case";
import { ListCategoriesUseCase } from "../application/list-categories.use-case";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { UpdateProductStatusDto } from "./dto/update-product-status.dto";
import { AdjustStockDto } from "./dto/adjust-stock.dto";
import { AdjustProductStockUseCase } from "../application/adjust-product-stock.use-case";

@AdminOnly()
@Controller()
export class AdminProductsController {
  constructor(
    private readonly listAdminProductsUseCase: ListAdminProductsUseCase,
    private readonly getAdminProductUseCase: GetAdminProductUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly updateProductStatusUseCase: UpdateProductStatusUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly adjustProductStockUseCase: AdjustProductStockUseCase
  ) {}

  @Get("admin/products")
  async listAdminProducts() {
    const products = await this.listAdminProductsUseCase.execute();

    return products.map(toAdminProductOutput);
  }

  @Post("admin/products")
  async createProduct(
    @Body() body: CreateProductDto
  ) {
    try {
      const product = await this.createProductUseCase.execute({
        name: body.name,
        slug: body.slug,
        description: body.description,
        priceCents: body.priceCents,
        images: body.images,
        categoryId: body.categoryId,
        unitId: body.unitId
      });

      return product;
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Get("admin/products/:id")
  async getAdminProduct(@Param("id") id: string) {
    const product = await this.getAdminProductUseCase.execute(id);

    if (!product) {
      throw new NotFoundException("Produto nao encontrado.");
    }

    const categories = await this.listCategoriesUseCase.execute(false);

    return {
      product: toAdminProductOutput(product),
      categories: categories.map(toCategoryOutput)
    };
  }

  @Patch("admin/products/:id/status")
  async updateProductStatus(
    @Param("id") id: string,
    @Body() body: UpdateProductStatusDto
  ) {
    try {
      const product = await this.updateProductStatusUseCase.execute({
        productId: id,
        active: body.active
      });

      return toAdminProductOutput(product);
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
    @Body() body: UpdateProductDto
  ) {
    try {
      const product = await this.updateProductUseCase.execute({
        productId: id,
        name: body.name,
        slug: body.slug,
        description: body.description,
        priceCents: body.priceCents,
        images: body.images,
        categoryId: body.categoryId
      });

      return product;
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Delete("admin/products/:id")
  async deleteProduct(@Param("id") id: string) {
    try {
      await this.deleteProductUseCase.execute(id);
      return { deleted: true };
    } catch (error) {
      if (error instanceof DomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Patch("admin/products/:id/stock")
  async adjustStock(@Param("id") id: string, @Body() body: AdjustStockDto) {
    try {
      const product = await this.adjustProductStockUseCase.execute(id, body.delta);
      if (!product) throw new NotFoundException("Produto nao encontrado.");
      return toAdminProductOutput(product);
    } catch (error) {
      if (error instanceof DomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }
}
