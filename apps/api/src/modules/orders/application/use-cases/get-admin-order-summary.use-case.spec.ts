import assert from "node:assert/strict";
import test from "node:test";
import { DomainError } from "../../../shared/domain/errors/domain-error";
import { OrderStatus } from "../../domain/entities/order.entity";
import { OrderRepository, OrderStatusTotals } from "../../domain/repositories/order.repository";
import { GetAdminOrderSummaryUseCase } from "./get-admin-order-summary.use-case";

const NOW = new Date("2026-11-16T12:00:00.000Z");

function build(byStatus: OrderStatusTotals[], createdSince = 0) {
  const calls: Date[] = [];
  const repo = {
    async summarize(since: Date) {
      calls.push(since);
      return { byStatus, createdSince };
    }
  } as unknown as OrderRepository;
  return { useCase: new GetAdminOrderSummaryUseCase(repo, () => NOW), calls };
}

const all: OrderStatusTotals[] = [
  { status: OrderStatus.CREATED, count: 1, totalCents: 1000 },
  { status: OrderStatus.AWAITING_PAYMENT, count: 2, totalCents: 2000 },
  { status: OrderStatus.PAID, count: 3, totalCents: 3000 },
  { status: OrderStatus.PREPARING, count: 1, totalCents: 500 },
  { status: OrderStatus.SHIPPED, count: 2, totalCents: 700 },
  { status: OrderStatus.DELIVERED, count: 4, totalCents: 4000 },
  { status: OrderStatus.CANCELLED, count: 5, totalCents: 9999 }
];

test("agrega contagens por grupo e receita", async () => {
  const { useCase } = build(all, 7);
  const out = await useCase.execute({ periodDays: 30 });

  assert.deepEqual(out, {
    totalOrders: 18,
    awaitingPayment: 3,
    inProgress: 6,
    delivered: 4,
    cancelled: 5,
    revenueCents: 8200,
    periodDays: 30,
    periodStart: "2026-10-17T12:00:00.000Z",
    ordersInPeriod: 7
  });
  assert.equal(out.awaitingPayment + out.inProgress + out.delivered + out.cancelled, out.totalOrders);
});

test("cancelados e pendentes nao entram na receita", async () => {
  const { useCase } = build([
    { status: OrderStatus.CANCELLED, count: 1, totalCents: 5000 },
    { status: OrderStatus.CREATED, count: 1, totalCents: 100 },
    { status: OrderStatus.AWAITING_PAYMENT, count: 1, totalCents: 200 }
  ]);
  const out = await useCase.execute({ periodDays: 30 });
  assert.equal(out.revenueCents, 0);
  assert.equal(out.awaitingPayment, 2);
});

test("status ausentes contam zero", async () => {
  const { useCase } = build([]);
  const out = await useCase.execute({ periodDays: 1 });
  assert.equal(out.totalOrders, 0);
  assert.equal(out.revenueCents, 0);
});

test("repassa periodStart ao repositorio como now - periodDays*24h", async () => {
  const { useCase, calls } = build([]);
  const out = await useCase.execute({ periodDays: 7 });
  assert.equal(calls[0].toISOString(), "2026-11-09T12:00:00.000Z");
  assert.equal(out.periodStart, "2026-11-09T12:00:00.000Z");
});

test("rejeita periodDays invalido", async () => {
  const { useCase, calls } = build([]);
  for (const periodDays of [0, 366, 1.5, Number.NaN, -1]) {
    await assert.rejects(() => useCase.execute({ periodDays }), (error: unknown) => {
      assert.ok(error instanceof DomainError);
      assert.equal(error.message, "Periodo invalido.");
      return true;
    });
  }
  assert.equal(calls.length, 0);
  await useCase.execute({ periodDays: 365 });
  assert.equal(calls.length, 1);
});

test("saida contem apenas primitivos", async () => {
  const { useCase } = build(all, 1);
  const out = await useCase.execute({ periodDays: 30 });
  for (const value of Object.values(out)) {
    assert.ok(typeof value === "number" || typeof value === "string");
  }
});
