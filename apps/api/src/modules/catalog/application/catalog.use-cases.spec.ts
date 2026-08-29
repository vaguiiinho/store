import assert from "node:assert/strict";
import test from "node:test";
import { Category } from "../domain/entities/category.entity";
import { Product } from "../domain/entities/product.entity";
import { CategoryRepository } from "../domain/repositories/category.repository";
import { ProductRepository } from "../domain/repositories/product.repository";
import { StockRepository } from "../../inventory/domain/repositories/stock.repository";
import { CreateProductUseCase } from "./create-product.use-case";
import { ListActiveProductsUseCase } from "./list-active-products.use-case";
import { GetProductBySlugUseCase } from "./get-product-by-slug.use-case";
import { UpdateProductStatusUseCase } from "./update-product-status.use-case";
import { AdjustProductStockUseCase } from "./adjust-product-stock.use-case";
import { DeleteProductUseCase } from "./delete-product.use-case";
import { GetAdminProductUseCase } from "./get-admin-product.use-case";
import { ListAdminProductsUseCase } from "./list-admin-products.use-case";
import { ListCategoriesUseCase } from "./list-categories.use-case";
import { UpdateProductUseCase } from "./update-product.use-case";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

const CATEGORY_ID = "00000000-0000-4000-8000-000000000001";

class ProductRepositoryMock implements ProductRepository {
  products: Product[] = [];
  async findById(id: string) { return this.products.find((product) => product.id === id) ?? null; }
  async findBySlug(slug: string) { return this.products.find((product) => product.slug === slug) ?? null; }
  async findAll(activeOnly = true) { return activeOnly ? this.products.filter((product) => product.active) : this.products; }
  async save(product: Product) { this.products = [...this.products.filter((current) => current.id !== product.id), product]; }
  async update(product: Product) { await this.save(product); }
  async delete(id: string) { this.products = this.products.filter((product) => product.id !== id); }
}

const category = Category.create({ id: CATEGORY_ID, name: "Cafe", slug: "cafe" });
const categories: CategoryRepository = {
  findById: async (id) => id === category.id ? category : null,
  findBySlug: async (slug) => slug === category.slug ? category : null,
  findAll: async () => [category],
  save: async () => undefined
};

async function createProduct(repository: ProductRepositoryMock) {
  return new CreateProductUseCase(repository, categories).execute({
    name: "Cafeteira",
    slug: "cafeteira",
    description: "Compacta e rapida",
    priceCents: 27900,
    images: ["https://example.com/cafeteira.jpg"],
    categoryIds: [CATEGORY_ID],
    availableQuantity: 5
  });
}

test("create product cria agregado validado e rejeita slug duplicado", async () => {
  const repository = new ProductRepositoryMock();
  const product = await createProduct(repository);
  assert.equal(product.categories[0].id, CATEGORY_ID);
  assert.equal(product.stock?.available, 5);
  await assert.rejects(() => createProduct(repository), /Ja existe/);
});

test("list, get e update status usam o contrato do repositorio", async () => {
  const repository = new ProductRepositoryMock();
  const product = await createProduct(repository);
  assert.equal((await new ListActiveProductsUseCase(repository).execute()).length, 1);
  assert.equal((await new GetProductBySlugUseCase(repository).execute("cafeteira"))?.id, product.id);
  await new UpdateProductStatusUseCase(repository).execute({ productId: product.id, active: false });
  assert.equal((await repository.findById(product.id))?.active, false);
});

test("adjust stock e delete product orquestram dependencias e erros", async () => {
  const repository = new ProductRepositoryMock();
  const product = await createProduct(repository);
  let deltaReceived = 0;
  const stocks = { adjustAvailable: async (_id: string, _variant: string | null, delta: number) => { deltaReceived = delta; return product.stock!; } } as StockRepository;
  await new AdjustProductStockUseCase(repository, stocks).execute(product.id, 3);
  assert.equal(deltaReceived, 3);

  const prisma = { orderItem: { count: async () => 0 } } as unknown as PrismaService;
  await new DeleteProductUseCase(repository, prisma).execute(product.id);
  assert.equal(await repository.findById(product.id), null);
});

test("consultas administrativas, categorias e update retornam outputs tipados", async () => {
  const repository = new ProductRepositoryMock();
  const product = await createProduct(repository);
  assert.equal((await new GetAdminProductUseCase(repository).execute(product.id))?.id, product.id);
  assert.equal((await new ListAdminProductsUseCase(repository).execute()).length, 1);
  assert.equal((await new ListCategoriesUseCase(categories).execute())[0].id, CATEGORY_ID);

  const updated = await new UpdateProductUseCase(repository).execute({
    productId: product.id,
    name: "Cafeteira Nova",
    slug: "cafeteira-nova",
    description: "Atualizada",
    priceCents: 29900,
    images: ["https://example.com/nova.jpg"],
    categoryIds: [CATEGORY_ID]
  });
  assert.equal(updated.name, "Cafeteira Nova");
  assert.equal(updated.priceCents, 29900);
});
