import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { Inject, Injectable } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { PRODUCT_REPOSITORY } from "../../catalog/catalog.tokens";
import { ProductRepository } from "../../catalog/domain/repositories/product.repository";
import { STOCK_REPOSITORY } from "../../inventory/inventory.tokens";
import { StockRepository } from "../../inventory/domain/repositories/stock.repository";
import { PAYMENT_GATEWAY } from "../../payments/payments.tokens";
import { PaymentGateway } from "../../payments/domain/payment-gateway";
import { CUSTOMER_REPOSITORY, ORDER_REPOSITORY } from "../orders.tokens";
import { CustomerRepository } from "../domain/repositories/customer.repository";
import { OrderRepository } from "../domain/repositories/order.repository";
import { Address } from "../domain/entities/address.entity";
import { Customer } from "../domain/entities/customer.entity";
import { Order, OrderStatus } from "../domain/entities/order.entity";
import { OrderItem } from "../domain/entities/order-item.entity";
import { Payment, PaymentMethod } from "../domain/entities/payment.entity";

export type ShippingRegion = "capital" | "interior" | "litoral";

export type CreateOrderItemInput = {
  productSlug: string;
  quantity: number;
  variantId?: string | null;
};

export type CreateOrderInput = {
  customer: {
    name: string;
    email?: string | null;
    phone: string;
    document?: string | null;
  };
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement?: string | null;
    district: string;
    city: string;
    state: string;
    reference?: string | null;
  };
  shippingRegion: ShippingRegion;
  paymentMethod: PaymentMethod;
  items: CreateOrderItemInput[];
};

const shippingTable: Record<ShippingRegion, number> = {
  capital: 1500,
  interior: 2300,
  litoral: 2900
};

function generateOrderNumber() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const suffix = randomUUID().slice(0, 6).toUpperCase();

  return `ORD-${stamp}-${suffix}`;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: StockRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly prisma: PrismaService
  ) {}

  async execute(input: CreateOrderInput) {
    if (input.items.length === 0) {
      throw new DomainError("Adicione ao menos um item ao pedido.");
    }

    const customerRecord = input.customer.email
      ? await this.customerRepository.findByEmail(input.customer.email)
      : null;

    const customer =
      customerRecord ??
      Customer.create({
        id: randomUUID(),
        name: input.customer.name,
        phone: input.customer.phone,
        email: input.customer.email ?? null,
        document: input.customer.document ?? null
      });

    customer.name = input.customer.name;
    customer.phone = input.customer.phone;
    customer.email = input.customer.email ?? null;
    customer.document = input.customer.document ?? null;

    const order = Order.create({
      id: randomUUID(),
      number: generateOrderNumber(),
      customerId: customer.id,
      customer,
      shippingAddress: Address.create({
        id: randomUUID(),
        customerId: customer.id,
        cep: input.shippingAddress.cep,
        street: input.shippingAddress.street,
        number: input.shippingAddress.number,
        complement: input.shippingAddress.complement ?? null,
        district: input.shippingAddress.district,
        city: input.shippingAddress.city,
        state: input.shippingAddress.state,
        reference: input.shippingAddress.reference ?? null
      }),
      shippingCents: shippingTable[input.shippingRegion],
      status: OrderStatus.CREATED
    });

    for (const item of input.items) {
      const product = await this.productRepository.findBySlug(item.productSlug);

      if (!product || !product.active) {
        throw new DomainError(`Produto indisponivel: ${item.productSlug}`);
      }

      const matchedVariant =
        item.variantId ? product.variants.find((variant) => variant.id === item.variantId) : null;

      if (item.variantId && (!matchedVariant || !matchedVariant.active)) {
        throw new DomainError(`Variacao indisponivel para ${product.slug}`);
      }

      order.addItem(
        OrderItem.create({
          id: randomUUID(),
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPriceCents: product.priceCents,
          variantId: matchedVariant?.id ?? null
        })
      );
    }

    const paymentSession = await this.paymentGateway.createPayment({
      orderId: order.id,
      orderNumber: order.number,
      amountCents: order.totalCents,
      paymentMethod: input.paymentMethod,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document
      },
      shippingAddress: {
        cep: order.shippingAddress.cep,
        street: order.shippingAddress.street,
        number: order.shippingAddress.number,
        complement: order.shippingAddress.complement,
        district: order.shippingAddress.district,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        reference: order.shippingAddress.reference
      },
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        variantId: item.variantId
      })),
      returnUrl: process.env.APP_URL ?? null,
      webhookUrl: process.env.APP_URL ? `${process.env.APP_URL}/api/payments/webhook` : null,
      metadata: {
        orderId: order.id,
        orderNumber: order.number,
        paymentMethod: input.paymentMethod
      }
    });

    order.payment = Payment.create({
      id: randomUUID(),
      orderId: order.id,
      method: input.paymentMethod,
      amountCents: order.totalCents,
      status: paymentSession.status,
      externalReference: paymentSession.externalReference,
      gatewayReference: paymentSession.gatewayReference,
      provider: paymentSession.provider,
      checkoutUrl: paymentSession.checkoutUrl,
      qrCodeText: paymentSession.qrCodeText,
      qrCodeBase64: paymentSession.qrCodeBase64,
      instructions: paymentSession.instructions,
      expiresAt: paymentSession.expiresAt
    });

    order.markAwaitingPayment();

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await this.customerRepository.save(customer, tx);

      for (const item of input.items) {
        const product = await this.productRepository.findBySlug(item.productSlug);

        if (!product || !product.active) {
          throw new DomainError(`Produto indisponivel: ${item.productSlug}`);
        }

        const matchedVariant =
          item.variantId ? product.variants.find((variant) => variant.id === item.variantId) : null;

        if (item.variantId && (!matchedVariant || !matchedVariant.active)) {
          throw new DomainError(`Variacao indisponivel para ${product.slug}`);
        }

        await this.stockRepository.reserve(product.id, matchedVariant?.id ?? null, item.quantity, tx);
      }

      await this.orderRepository.save(order, tx);
    });

    return order;
  }
}
