import { Order } from "../entities/order.entity";

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByNumber(number: string): Promise<Order | null>;
  findByPaymentGatewayReference(gatewayReference: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}
