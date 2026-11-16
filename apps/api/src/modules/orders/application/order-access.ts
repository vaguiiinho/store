import { AuthenticatedUser, UserRole } from "../../auth/domain/user";
import { Order } from "../domain/entities/order.entity";

/** Admin acessa qualquer pedido; usuario comum apenas os proprios. */
export function canAccessOrder(user: Pick<AuthenticatedUser, "id" | "role">, order: Pick<Order, "userId">) {
  return user.role === UserRole.ADMIN || (order.userId !== null && order.userId === user.id);
}
