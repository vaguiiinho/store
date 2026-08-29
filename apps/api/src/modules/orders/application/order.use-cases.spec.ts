import assert from "node:assert/strict";
import test from "node:test";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { Product } from "../../catalog/domain/entities/product.entity";
import { ProductRepository } from "../../catalog/domain/repositories/product.repository";
import { Stock } from "../../inventory/domain/entities/stock.entity";
import { StockRepository } from "../../inventory/domain/repositories/stock.repository";
import { PaymentGateway } from "../../payments/domain/payment-gateway";
import { PaymentMethod, PaymentStatus } from "../domain/entities/payment.entity";
import { CustomerRepository } from "../domain/repositories/customer.repository";
import { OrderRepository } from "../domain/repositories/order.repository";
import { CreateOrderUseCase } from "./create-order.use-case";
import { UpdateOrderStatusUseCase } from "./update-order-status.use-case";
import { DeleteOrderUseCase } from "./delete-order.use-case";
import { OrderStatus } from "../domain/entities/order.entity";

const PRODUCT_ID = "10000000-0000-4000-8000-000000000001";
const STOCK_ID = "20000000-0000-4000-8000-000000000001";

test("create order usa mocks, calcula total e reserva estoque", async () => {
  const product = Product.create({ id: PRODUCT_ID, name: "Cafeteira", slug: "cafeteira", description: "Compacta", priceCents: 2000 });
  const products = { findBySlug: async () => product } as unknown as ProductRepository;
  const stock = Stock.create({ id: STOCK_ID, productId: PRODUCT_ID, availableQuantity: 5 });
  let reserved = 0;
  const stocks = { reserve: async (_productId: string, _variantId: string | null, quantity: number) => { reserved += quantity; return stock; } } as StockRepository;
  const gateway = {
    createPayment: async () => ({ provider: "mock" as const, gatewayReference: "pay-1", externalReference: "ext-1", status: PaymentStatus.PENDING, checkoutUrl: null, qrCodeText: "pix", qrCodeBase64: null, instructions: [], expiresAt: new Date(Date.now() + 60000), raw: {} })
  } as unknown as PaymentGateway;
  const customers = { findByEmail: async () => null, save: async () => undefined } as unknown as CustomerRepository;
  let savedOrderId: string | null = null;
  const orders = { save: async (order: { id: string }) => { savedOrderId = order.id; } } as unknown as OrderRepository;
  const prisma = { $transaction: async (callback: (tx: Prisma.TransactionClient) => Promise<void>) => callback({} as Prisma.TransactionClient) } as unknown as PrismaService;

  const order = await new CreateOrderUseCase(products, stocks, gateway, customers, orders, prisma).execute({
    customer: { name: "Maria", email: "maria@example.com", phone: "11999999999" },
    shippingAddress: { cep: "01001000", street: "Rua A", number: "1", district: "Centro", city: "Sao Paulo", state: "SP" },
    shippingRegion: "capital",
    paymentMethod: PaymentMethod.PIX,
    items: [{ productSlug: "cafeteira", quantity: 2 }]
  });

  assert.equal(order.totalCents, 5500);
  assert.equal(order.status, OrderStatus.AWAITING_PAYMENT);
  assert.equal(reserved, 2);
  assert.equal(savedOrderId, order.id);
});

test("update order status rejeita pedido inexistente", async () => {
  const orders = { findById: async () => null } as unknown as OrderRepository;
  await assert.rejects(() => new UpdateOrderStatusUseCase(orders).execute({ orderId: "40000000-0000-4000-8000-000000000001", status: OrderStatus.PAID }), /nao encontrado/);
});

test("delete order remove pedido inexistente somente depois da validacao", async () => {
  const orders = { findById: async () => null } as unknown as OrderRepository;
  const stocks = {} as StockRepository;
  const prisma = {} as PrismaService;
  await assert.rejects(() => new DeleteOrderUseCase(orders, stocks, prisma).execute("40000000-0000-4000-8000-000000000001"), /nao encontrado/);
});
