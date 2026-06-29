import { Body, Controller, Headers, HttpCode, Inject, Post } from "@nestjs/common";
import { PAYMENT_GATEWAY } from "../payments.tokens";
import { PaymentGateway } from "../domain/payment-gateway";

@Controller()
export class PaymentsController {
  constructor(
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway
  ) {}

  @Post("payments/webhook")
  @HttpCode(200)
  async webhook(@Body() body: unknown, @Headers() headers: Record<string, string | string[] | undefined>) {
    const event = await this.paymentGateway.parseWebhook({ body, headers });

    if (!event) {
      return { received: true };
    }

    return {
      received: true,
      gatewayReference: event.gatewayReference,
      externalReference: event.externalReference,
      status: event.status
    };
  }
}
