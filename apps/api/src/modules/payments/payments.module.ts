import { Module } from "@nestjs/common";
import { PAYMENT_GATEWAY } from "./payments.tokens";
import { MockPaymentGateway } from "./infrastructure/mock-payment.gateway";
import { PaymentsController } from "./presentation/payments.controller";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { ORDER_REPOSITORY } from "../orders/orders.tokens";
import { PrismaOrderRepository } from "../orders/infrastructure/prisma/prisma-order.repository";
import { HandlePaymentWebhookUseCase } from "./application/handle-payment-webhook.use-case";
import { GetPaymentByGatewayReferenceUseCase } from "./application/get-payment-by-gateway-reference.use-case";
import { MercadoPagoPaymentGateway } from "./infrastructure/mercado-pago.payment.gateway";
import { InventoryModule } from "../inventory/inventory.module";

@Module({
  imports: [PrismaModule, InventoryModule],
  controllers: [PaymentsController],
  providers: [
    HandlePaymentWebhookUseCase,
    GetPaymentByGatewayReferenceUseCase,
    {
      provide: PAYMENT_GATEWAY,
      useFactory: () => {
        if ((process.env.PAYMENT_PROVIDER ?? "mock") === "mercado_pago") {
          return new MercadoPagoPaymentGateway();
        }

        return new MockPaymentGateway();
      }
    },
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository
    }
  ],
  exports: [PAYMENT_GATEWAY]
})
export class PaymentsModule {}
