import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { CreateOrderUseCase } from "../application/create-order.use-case";
import { CreateOrderDto } from "./dto/create-order.dto";

function serializeOrder(order: Awaited<ReturnType<CreateOrderUseCase["execute"]>>) {
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    customer: order.customer
      ? {
          id: order.customer.id,
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
          document: order.customer.document
        }
      : null,
    shippingAddress: {
      id: order.shippingAddress.id,
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
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      variantId: item.variantId,
      totalCents: item.totalCents
    })),
    payment: order.payment
      ? {
          id: order.payment.id,
          method: order.payment.method,
          status: order.payment.status,
          amountCents: order.payment.amountCents,
          externalReference: order.payment.externalReference,
          gatewayReference: order.payment.gatewayReference,
          provider: order.payment.provider,
          checkoutUrl: order.payment.checkoutUrl,
          qrCodeText: order.payment.qrCodeText,
          qrCodeBase64: order.payment.qrCodeBase64,
          instructions: order.payment.instructions,
          expiresAt: order.payment.expiresAt
        }
      : null
  };
}

@Controller()
export class OrdersController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

  @Post("orders")
  async create(@Body() body: CreateOrderDto) {
    try {
      const order = await this.createOrderUseCase.execute(body);
      return serializeOrder(order);
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
