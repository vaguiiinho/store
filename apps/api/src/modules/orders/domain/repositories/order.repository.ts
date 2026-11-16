import { Prisma } from "@prisma/client";
import { Order, OrderStatus } from "../entities/order.entity";

export type OrderStatusTotals = { status: OrderStatus; count: number; totalCents: number };
export type OrderSummarySnapshot = { byStatus: OrderStatusTotals[]; createdSince: number };

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByNumber(number: string): Promise<Order | null>;
  findByPaymentGatewayReference(gatewayReference: string): Promise<Order | null>;
  findExpiredAwaitingPayment(now: Date, limit?: number): Promise<Order[]>;
  findAll(limit?: number): Promise<Order[]>;
  findByUserId(userId: string, limit?: number): Promise<Order[]>;
  save(order: Order, tx?: Prisma.TransactionClient): Promise<void>;
  delete(id: string, tx?: Prisma.TransactionClient): Promise<void>;
  /** Contagem e soma de totalCents por status (todos os pedidos) + quantidade de pedidos com createdAt >= since. Status sem pedidos podem estar ausentes. */
  summarize(since: Date): Promise<OrderSummarySnapshot>;
}
