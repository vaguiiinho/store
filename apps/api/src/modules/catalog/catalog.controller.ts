import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { GetProductBySlugUseCase } from "./application/get-product-by-slug.use-case";
import { ListActiveProductsUseCase } from "./application/list-active-products.use-case";
import { ListCategoriesUseCase } from "./application/list-categories.use-case";

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
export class CatalogController {
  constructor(
    private readonly listActiveProductsUseCase: ListActiveProductsUseCase,
    private readonly getProductBySlugUseCase: GetProductBySlugUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase
  ) {}

  @Get("products")
  async listProducts() {
    const products = await this.listActiveProductsUseCase.execute();

    return products.map(serializeProduct);
  }

  @Get("products/:slug")
  async getProduct(@Param("slug") slug: string) {
    const product = await this.getProductBySlugUseCase.execute(slug);

    if (!product || !product.active) {
      throw new NotFoundException("Produto nao encontrado.");
    }

    return serializeProduct(product);
  }

  @Get("categories")
  async listCategories() {
    const categories = await this.listCategoriesUseCase.execute(true);

    return categories.map(serializeCategory);
  }
}
