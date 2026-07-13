import { Prisma } from "@prisma/client";
import { Order } from "../entities/order.entity";

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByNumber(number: string): Promise<Order | null>;
  findByPaymentGatewayReference(gatewayReference: string): Promise<Order | null>;
  findExpiredAwaitingPayment(now: Date, limit?: number): Promise<Order[]>;
  findAll(limit?: number): Promise<Order[]>;
  findByCustomerContact(email: string, phone: string, limit?: number): Promise<Order[]>;
  save(order: Order, tx?: Prisma.TransactionClient): Promise<void>;
  delete(id: string, tx?: Prisma.TransactionClient): Promise<void>;
}
