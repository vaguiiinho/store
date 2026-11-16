import { BadRequestException, Body, Controller, Delete, Get, Inject, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { DeleteOrderUseCase } from "../application/delete-order.use-case";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { CreateOrderUseCase } from "../application/create-order.use-case";
import { GetAdminOrderSummaryUseCase } from "../application/use-cases/get-admin-order-summary.use-case";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ORDER_REPOSITORY } from "../orders.tokens";
import { OrderRepository } from "../domain/repositories/order.repository";
import { UpdateOrderStatusUseCase } from "../application/update-order-status.use-case";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { AdminOnly, CurrentUser } from "../../auth/presentation/decorators";
import { AuthenticatedUser } from "../../auth/domain/user";
import { canAccessOrder } from "../application/order-access";

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
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
    private readonly getAdminOrderSummaryUseCase: GetAdminOrderSummaryUseCase,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository
  ) {}

  private serialize(order: Awaited<ReturnType<CreateOrderUseCase["execute"]>>) {
    return serializeOrder(order);
  }

  private rethrowDomainError(error: unknown): never {
    if (error instanceof DomainError) {
      throw new BadRequestException(error.message);
    }

    throw error;
  }

  @Post("orders")
  async create(@Body() body: CreateOrderDto, @CurrentUser() user: AuthenticatedUser) {
    try {
      const order = await this.createOrderUseCase.execute({ ...body, userId: user.id });
      return this.serialize(order);
    } catch (error) {
      this.rethrowDomainError(error);
    }
  }

  /** Pedidos do usuario autenticado. */
  @Get("orders")
  async listMyOrders(@CurrentUser() user: AuthenticatedUser) {
    const orders = await this.orderRepository.findByUserId(user.id);
    return orders.map((order) => this.serialize(order));
  }

  /** Dono do pedido ou admin. Para outros usuarios responde 404 para nao revelar a existencia do pedido. */
  @Get("orders/number/:number")
  async getByNumber(@Param("number") number: string, @CurrentUser() user: AuthenticatedUser) {
    const order = await this.orderRepository.findByNumber(number);

    if (!order || !canAccessOrder(user, order)) {
      throw new NotFoundException("Pedido nao encontrado.");
    }

    return this.serialize(order);
  }

  @AdminOnly()
  @Get("admin/orders")
  async listAdminOrders() {
    const orders = await this.orderRepository.findAll(50);
    return orders.map((order) => this.serialize(order));
  }

  @AdminOnly()
  @Get("admin/orders/summary")
  async getAdminOrderSummary() {
    try {
      return await this.getAdminOrderSummaryUseCase.execute({ periodDays: 30 });
    } catch (error) {
      this.rethrowDomainError(error);
    }
  }

  @AdminOnly()
  @Get("admin/users/:id/orders")
  async listUserOrders(@Param("id", ParseUUIDPipe) id: string) {
    const orders = await this.orderRepository.findByUserId(id);
    return orders.map((order) => this.serialize(order));
  }

  @AdminOnly()
  @Patch("admin/orders/:id/status")
  async updateAdminOrderStatus(@Param("id") id: string, @Body() body: UpdateOrderStatusDto) {
    try {
      const order = await this.updateOrderStatusUseCase.execute({ orderId: id, status: body.status });
      return this.serialize(order);
    } catch (error) {
      this.rethrowDomainError(error);
    }
  }

  @AdminOnly()
  @Delete("admin/orders/:id")
  async deleteAdminOrder(@Param("id") id: string) {
    try {
      await this.deleteOrderUseCase.execute(id);
      return { deleted: true };
    } catch (error) {
      this.rethrowDomainError(error);
    }
  }
}
