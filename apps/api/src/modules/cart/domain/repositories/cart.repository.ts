import { Cart } from "../entities/cart.entity";

export interface CartRepository {
  findById(id: string): Promise<Cart | null>;
  findOpenByCustomerId(customerId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
}
