import { Body, Controller, Headers, HttpCode, Inject, NotFoundException, Param, Get, Post } from "@nestjs/common";
import { PAYMENT_GATEWAY } from "../payments.tokens";
import { PaymentGateway } from "../domain/payment-gateway";
import { HandlePaymentWebhookUseCase } from "../application/handle-payment-webhook.use-case";
import { GetPaymentByGatewayReferenceUseCase } from "../application/get-payment-by-gateway-reference.use-case";

@Controller()
export class PaymentsController {
  constructor(
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway,
    private readonly handlePaymentWebhookUseCase: HandlePaymentWebhookUseCase,
    private readonly getPaymentByGatewayReferenceUseCase: GetPaymentByGatewayReferenceUseCase
  ) {}

  @Post("payments/webhook")
  @HttpCode(200)
  async webhook(@Body() body: unknown, @Headers() headers: Record<string, string | string[] | undefined>) {
    const event = await this.paymentGateway.parseWebhook({ body, headers });

    if (!event) {
      return { received: true };
    }

    const order = await this.handlePaymentWebhookUseCase.execute({
      gatewayReference: event.gatewayReference,
      externalReference: event.externalReference,
      status: event.status
    });

    return {
      received: true,
      gatewayReference: event.gatewayReference,
      externalReference: event.externalReference,
      status: event.status,
      orderNumber: order?.number ?? null,
      orderStatus: order?.status ?? null
    };
  }

  @Get("payments/:gatewayReference")
  async getByGatewayReference(@Param("gatewayReference") gatewayReference: string) {
    try {
      const result = await this.getPaymentByGatewayReferenceUseCase.execute(gatewayReference);

      return {
        orderNumber: result.order.number,
        orderStatus: result.order.status,
        payment: {
          id: result.payment.id,
          method: result.payment.method,
          status: result.payment.status,
          amountCents: result.payment.amountCents,
          externalReference: result.payment.externalReference,
          gatewayReference: result.payment.gatewayReference,
          provider: result.payment.provider,
          checkoutUrl: result.payment.checkoutUrl,
          qrCodeText: result.payment.qrCodeText,
          qrCodeBase64: result.payment.qrCodeBase64,
          instructions: result.payment.instructions,
          expiresAt: result.payment.expiresAt
        }
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Pagamento nao encontrado.") {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
