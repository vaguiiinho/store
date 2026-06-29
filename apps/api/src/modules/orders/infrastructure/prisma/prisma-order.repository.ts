import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { Address } from "../../domain/entities/address.entity";
import { Customer } from "../../domain/entities/customer.entity";
import { Order, OrderStatus } from "../../domain/entities/order.entity";
import { OrderItem } from "../../domain/entities/order-item.entity";
import { Payment, PaymentMethod, PaymentStatus } from "../../domain/entities/payment.entity";
import { OrderRepository } from "../../domain/repositories/order.repository";

type PrismaOrderRecord = {
  id: string;
  number: string;
  customerId: string | null;
  shippingAddressId: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  status: OrderStatus;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    document: string | null;
  } | null;
  shippingAddress: {
    id: string;
    customerId: string | null;
    cep: string;
    street: string;
    number: string;
    complement: string | null;
    district: string;
    city: string;
    state: string;
    reference: string | null;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPriceCents: number;
    variantId: string | null;
  }>;
  payment: {
    id: string;
    orderId: string;
    method: PaymentMethod;
    status: PaymentStatus;
    amountCents: number;
    externalReference: string | null;
    gatewayReference: string | null;
  } | null;
};

function mapOrder(record: PrismaOrderRecord) {
  return Order.create({
    id: record.id,
    number: record.number,
    customerId: record.customerId,
    customer: record.customer
      ? Customer.create({
          id: record.customer.id,
          name: record.customer.name,
          email: record.customer.email,
          phone: record.customer.phone,
          document: record.customer.document
        })
      : null,
    shippingAddress: Address.create({
      id: record.shippingAddress.id,
      customerId: record.shippingAddress.customerId,
      cep: record.shippingAddress.cep,
      street: record.shippingAddress.street,
      number: record.shippingAddress.number,
      complement: record.shippingAddress.complement,
      district: record.shippingAddress.district,
      city: record.shippingAddress.city,
      state: record.shippingAddress.state,
      reference: record.shippingAddress.reference
    }),
    items: record.items.map((item) =>
      OrderItem.create({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        variantId: item.variantId
      })
    ),
    subtotalCents: record.subtotalCents,
    shippingCents: record.shippingCents,
    status: record.status,
    payment: record.payment
      ? Payment.create({
          id: record.payment.id,
          orderId: record.payment.orderId,
          method: record.payment.method,
          status: record.payment.status,
          amountCents: record.payment.amountCents,
          externalReference: record.payment.externalReference,
          gatewayReference: record.payment.gatewayReference
        })
      : null
  });
}

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        shippingAddress: true,
        items: true,
        payment: true
      }
    });

    return order ? mapOrder(order as PrismaOrderRecord) : null;
  }

  async findByNumber(number: string) {
    const order = await this.prisma.order.findUnique({
      where: { number },
      include: {
        customer: true,
        shippingAddress: true,
        items: true,
        payment: true
      }
    });

    return order ? mapOrder(order as PrismaOrderRecord) : null;
  }

  async save(order: Order) {
    await this.prisma.order.upsert({
      where: { id: order.id },
      create: {
        id: order.id,
        number: order.number,
        customer: order.customer
          ? {
              connectOrCreate: {
                where: { id: order.customer.id },
                create: {
                  id: order.customer.id,
                  name: order.customer.name,
                  email: order.customer.email,
                  phone: order.customer.phone,
                  document: order.customer.document
                }
              }
            }
          : undefined,
        shippingAddress: {
          create: {
            id: order.shippingAddress.id,
            customerId: order.shippingAddress.customerId,
            cep: order.shippingAddress.cep,
            street: order.shippingAddress.street,
            number: order.shippingAddress.number,
            complement: order.shippingAddress.complement,
            district: order.shippingAddress.district,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            reference: order.shippingAddress.reference
          }
        },
        items: {
          create: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            variantId: item.variantId,
            totalCents: item.totalCents
          }))
        },
        payment: order.payment
          ? {
              create: {
                id: order.payment.id,
                method: order.payment.method,
                status: order.payment.status,
                amountCents: order.payment.amountCents,
                externalReference: order.payment.externalReference,
                gatewayReference: order.payment.gatewayReference
              }
            }
          : undefined,
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCents,
        totalCents: order.totalCents,
        status: order.status
      },
      update: {
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCents,
        totalCents: order.totalCents,
        status: order.status
      }
    });
  }
}
