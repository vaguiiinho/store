import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import test, { after, before, beforeEach } from "node:test";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaService } from "../src/infrastructure/prisma/prisma.service";
import { Category } from "../src/modules/catalog/domain/entities/category.entity";
import { Product } from "../src/modules/catalog/domain/entities/product.entity";
import { Variant } from "../src/modules/catalog/domain/entities/variant.entity";
import { PrismaCategoryRepository } from "../src/modules/catalog/infrastructure/prisma/prisma-category.repository";
import { PrismaProductRepository } from "../src/modules/catalog/infrastructure/prisma/prisma-product.repository";
import { Stock } from "../src/modules/inventory/domain/entities/stock.entity";
import { PrismaStockRepository } from "../src/modules/inventory/infrastructure/prisma/prisma-stock.repository";
import { Address } from "../src/modules/orders/domain/entities/address.entity";
import { Customer } from "../src/modules/orders/domain/entities/customer.entity";
import { Order } from "../src/modules/orders/domain/entities/order.entity";
import { OrderItem } from "../src/modules/orders/domain/entities/order-item.entity";
import { Payment, PaymentMethod } from "../src/modules/orders/domain/entities/payment.entity";
import { PrismaCustomerRepository } from "../src/modules/orders/infrastructure/prisma/prisma-customer.repository";
import { PrismaOrderRepository } from "../src/modules/orders/infrastructure/prisma/prisma-order.repository";

const execFileAsync = promisify(execFile);
const CATEGORY_ID = "00000000-0000-4000-8000-000000000001";
const PRODUCT_ID = "10000000-0000-4000-8000-000000000001";
const STOCK_ID = "20000000-0000-4000-8000-000000000001";
const VARIANT_ID = "30000000-0000-4000-8000-000000000001";
const CUSTOMER_ID = "70000000-0000-4000-8000-000000000001";
const ADDRESS_ID = "50000000-0000-4000-8000-000000000001";
const ORDER_ID = "40000000-0000-4000-8000-000000000001";
const ITEM_ID = "60000000-0000-4000-8000-000000000001";
const PAYMENT_ID = "80000000-0000-4000-8000-000000000001";

let container: StartedPostgreSqlContainer;
let prisma: PrismaService;

before(async () => {
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  process.env.DATABASE_URL = container.getConnectionUri();
  await execFileAsync(resolve(process.cwd(), "node_modules/.bin/prisma"), ["migrate", "deploy", "--schema", resolve(process.cwd(), "prisma/schema.prisma")], {
    env: { ...process.env, DATABASE_URL: container.getConnectionUri() }
  });
  prisma = new PrismaService();
  await prisma.$connect();
}, { timeout: 120_000 });

beforeEach(async () => {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Payment", "OrderItem", "Order", "Address", "CartItem", "Cart", "Stock", "Variant", "Product", "Category", "Customer" RESTART IDENTITY CASCADE');
});

after(async () => {
  await prisma?.$disconnect();
  await container?.stop();
});

test("PrismaCategoryRepository salva, lista e recupera categoria", async () => {
  const repository = new PrismaCategoryRepository(prisma);
  const category = Category.create({ id: CATEGORY_ID, name: "Cafe", slug: "cafe" });
  await repository.save(category);
  assert.equal((await repository.findBySlug("cafe"))?.id, CATEGORY_ID);
  assert.equal((await repository.findAll()).length, 1);
});

test("repositorios de produto e estoque persistem agregado e reserva atomica", async () => {
  const categories = new PrismaCategoryRepository(prisma);
  const products = new PrismaProductRepository(prisma);
  const stocks = new PrismaStockRepository(prisma);
  const category = Category.create({ id: CATEGORY_ID, name: "Cafe", slug: "cafe" });
  await categories.save(category);
  await products.save(Product.create({
    id: PRODUCT_ID,
    name: "Cafeteira",
    slug: "cafeteira",
    description: "Compacta",
    priceCents: 2000,
    categories: [category],
    variants: [Variant.create({ id: VARIANT_ID, productId: PRODUCT_ID, name: "Cor", value: "Preto" })],
    stock: Stock.create({ id: STOCK_ID, productId: PRODUCT_ID, availableQuantity: 5 })
  }));

  assert.equal((await products.findBySlug("cafeteira"))?.stock?.available, 5);
  assert.equal((await stocks.reserve(PRODUCT_ID, null, 2)).available, 3);
  assert.equal((await stocks.release(PRODUCT_ID, null, 1)).reserved, 1);
});

test("repositorios de cliente e pedido persistem e reconstituem o pedido completo", async () => {
  const categories = new PrismaCategoryRepository(prisma);
  const products = new PrismaProductRepository(prisma);
  const customers = new PrismaCustomerRepository(prisma);
  const orders = new PrismaOrderRepository(prisma);
  const category = Category.create({ id: CATEGORY_ID, name: "Cafe", slug: "cafe" });
  const product = Product.create({ id: PRODUCT_ID, name: "Cafeteira", slug: "cafeteira", description: "Compacta", priceCents: 2000, categories: [category] });
  await categories.save(category);
  await products.save(product);
  const customer = Customer.create({ id: CUSTOMER_ID, name: "Maria", email: "maria@example.com", phone: "11999999999" });
  await customers.save(customer);

  const order = Order.create({
    id: ORDER_ID,
    number: "ORD-TEST-1",
    customerId: customer.id,
    customer,
    shippingCents: 1500,
    shippingAddress: Address.create({ id: ADDRESS_ID, customerId: customer.id, cep: "01001000", street: "Rua A", number: "1", district: "Centro", city: "Sao Paulo", state: "SP" })
  });
  order.addItem(OrderItem.create({ id: ITEM_ID, productId: product.id, productName: product.name, quantity: 2, unitPriceCents: product.priceCents }));
  order.payment = Payment.create({ id: PAYMENT_ID, orderId: order.id, method: PaymentMethod.PIX, amountCents: order.totalCents });
  await orders.save(order);

  const restored = await orders.findByNumber(order.number);
  assert.equal(restored?.customer?.email, "maria@example.com");
  assert.equal(restored?.items[0].totalCents, 4000);
  assert.equal(restored?.payment?.amountCents, 5500);
});
