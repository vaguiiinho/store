import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { Customer } from "../../domain/entities/customer.entity";
import { CustomerRepository } from "../../domain/repositories/customer.repository";

type PrismaCustomerRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  document: string | null;
};

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id }
    });

    return customer ? this.toEntity(customer) : null;
  }

  async findByEmail(email: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { email }
    });

    return customer ? this.toEntity(customer) : null;
  }

  async save(customer: Customer, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    await client.customer.upsert({
      where: { id: customer.id },
      create: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document
      },
      update: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document
      }
    });
  }

  private toEntity(customer: PrismaCustomerRecord) {
    return Customer.create({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document
    });
  }
}
