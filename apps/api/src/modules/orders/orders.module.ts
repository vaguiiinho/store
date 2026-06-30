import { Module } from "@nestjs/common";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { PRODUCT_REPOSITORY } from "../catalog/catalog.tokens";
import { CUSTOMER_REPOSITORY, ORDER_REPOSITORY } from "./orders.tokens";
import { CreateOrderUseCase } from "./application/create-order.use-case";
import { OrdersController } from "./presentation/orders.controller";
import { PrismaCustomerRepository } from "./infrastructure/prisma/prisma-customer.repository";
import { PrismaOrderRepository } from "./infrastructure/prisma/prisma-order.repository";
import { PrismaProductRepository } from "../catalog/infrastructure/prisma/prisma-product.repository";
import { PaymentsModule } from "../payments/payments.module";
import { InventoryModule } from "../inventory/inventory.module";
import { UpdateOrderStatusUseCase } from "./application/update-order-status.use-case";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";

@Module({
  imports: [PrismaModule, PaymentsModule, InventoryModule, AdminAuthModule],
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    UpdateOrderStatusUseCase,
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository
    }
  ]
})
export class OrdersModule {}
