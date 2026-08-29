import assert from "node:assert/strict";
import test from "node:test";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { StockRepository } from "../../inventory/domain/repositories/stock.repository";
import { Address } from "../../orders/domain/entities/address.entity";
import { Order, OrderStatus } from "../../orders/domain/entities/order.entity";
import { Payment, PaymentMethod, PaymentStatus } from "../../orders/domain/entities/payment.entity";
import { OrderRepository } from "../../orders/domain/repositories/order.repository";
import { GetPaymentByGatewayReferenceUseCase } from "./get-payment-by-gateway-reference.use-case";
import { HandlePaymentWebhookUseCase } from "./handle-payment-webhook.use-case";

function createOrder() {
  const order = Order.create({
    id: "40000000-0000-4000-8000-000000000001",
    number: "ORD-PAY-1",
    shippingAddress: Address.create({ cep: "01001000", street: "Rua A", number: "1", district: "Centro", city: "Sao Paulo", state: "SP" })
  });
  order.payment = Payment.create({
    id: "80000000-0000-4000-8000-000000000001",
    orderId: order.id,
    method: PaymentMethod.PIX,
    amountCents: 0,
    gatewayReference: "gateway-1"
  });
  order.markAwaitingPayment();
  return order;
}

test("get payment retorna pedido e pagamento ou erro de dominio", async () => {
  const order = createOrder();
  const repository = { findByPaymentGatewayReference: async () => order } as unknown as OrderRepository;
  const output = await new GetPaymentByGatewayReferenceUseCase(repository).execute("gateway-1");
  assert.equal(output.payment.id, order.payment?.id);
  const emptyRepository = { findByPaymentGatewayReference: async () => null } as unknown as OrderRepository;
  await assert.rejects(() => new GetPaymentByGatewayReferenceUseCase(emptyRepository).execute("missing"), /nao encontrado/);
});

test("webhook pago atualiza agregado dentro da transacao", async () => {
  const order = createOrder();
  let saved = false;
  const repository = {
    findByPaymentGatewayReference: async () => order,
    save: async () => { saved = true; }
  } as unknown as OrderRepository;
  const stocks = {} as StockRepository;
  const prisma = {
    $transaction: async (callback: (tx: Prisma.TransactionClient) => Promise<void>) => callback({} as Prisma.TransactionClient)
  } as unknown as PrismaService;
  const output = await new HandlePaymentWebhookUseCase(repository, stocks, prisma).execute({
    gatewayReference: "gateway-1",
    externalReference: "external-1",
    status: PaymentStatus.PAID
  });
  assert.equal(output?.status, OrderStatus.PAID);
  assert.equal(output?.payment?.status, PaymentStatus.PAID);
  assert.equal(saved, true);
});
