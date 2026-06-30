import { BadRequestException, Body, Controller, Get, Headers, Inject, NotFoundException, Param, Patch, Post, UnauthorizedException } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { CreateOrderUseCase } from "../application/create-order.use-case";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ORDER_REPOSITORY } from "../orders.tokens";
import { OrderRepository } from "../domain/repositories/order.repository";
import { UpdateOrderStatusUseCase } from "../application/update-order-status.use-case";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { AdminAuthService } from "../../admin-auth/admin-auth.service";

function serializeOrder(order: Awaited<ReturnType<CreateOrderUseCase["execute"]>>) {
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    createdAt: order.createdAt,
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
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly adminAuthService: AdminAuthService,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository
  ) {}

  private serialize(order: Awaited<ReturnType<CreateOrderUseCase["execute"]>>) {
    return serializeOrder(order);
  }

  @Post("orders")
  async create(@Body() body: CreateOrderDto) {
    try {
      const order = await this.createOrderUseCase.execute(body);
      return this.serialize(order);
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Get("orders/number/:number")
  async getByNumber(@Param("number") number: string) {
    const order = await this.orderRepository.findByNumber(number);

    if (!order) {
      throw new NotFoundException("Pedido nao encontrado.");
    }

    return this.serialize(order);
  }

  @Get("admin/orders")
  async listAdminOrders(@Headers("cookie") cookieHeader?: string) {
    const session = this.adminAuthService.verifyCookie(cookieHeader);

    if (!session) {
      throw new UnauthorizedException("Autenticacao de admin necessaria.");
    }

    const orders = await this.orderRepository.findAll(50);

    return orders.map((order) => this.serialize(order));
  }

  @Patch("admin/orders/:id/status")
  async updateAdminOrderStatus(
    @Param("id") id: string,
    @Body() body: UpdateOrderStatusDto,
    @Headers("cookie") cookieHeader?: string
  ) {
    const session = this.adminAuthService.verifyCookie(cookieHeader);

    if (!session) {
      throw new UnauthorizedException("Autenticacao de admin necessaria.");
    }

    try {
      const order = await this.updateOrderStatusUseCase.execute({
        orderId: id,
        status: body.status
      });

      return this.serialize(order);
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
