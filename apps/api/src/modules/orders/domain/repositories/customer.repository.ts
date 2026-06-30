import { Prisma } from "@prisma/client";
import { Customer } from "../entities/customer.entity";

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  save(customer: Customer, tx?: Prisma.TransactionClient): Promise<void>;
}
