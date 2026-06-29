import { Module } from "@nestjs/common";
import { PAYMENT_GATEWAY } from "./payments.tokens";
import { MockPaymentGateway } from "./infrastructure/mock-payment.gateway";
import { PaymentsController } from "./presentation/payments.controller";

@Module({
  controllers: [PaymentsController],
  providers: [
    {
      provide: PAYMENT_GATEWAY,
      useClass: MockPaymentGateway
    }
  ],
  exports: [PAYMENT_GATEWAY]
})
export class PaymentsModule {}
