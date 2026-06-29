import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  CreatePaymentGatewayInput,
  PaymentGateway,
  PaymentGatewayCreateResult,
  PaymentGatewayLookupResult,
  PaymentGatewayWebhookInput,
  PaymentGatewayWebhookResult
} from "../domain/payment-gateway";
import { PaymentMethod, PaymentStatus } from "../../orders/domain/entities/payment.entity";

function mapWebhookStatus(status: unknown) {
  if (typeof status !== "string") {
    return PaymentStatus.PENDING;
  }

  const normalized = status.toLowerCase();

  if (normalized === "approved" || normalized === "paid" || normalized === "authorized") {
    return PaymentStatus.PAID;
  }

  if (normalized === "declined" || normalized === "rejected" || normalized === "refused") {
    return PaymentStatus.DECLINED;
  }

  if (normalized === "canceled" || normalized === "cancelled" || normalized === "voided") {
    return PaymentStatus.CANCELLED;
  }

  return PaymentStatus.PENDING;
}

function buildInstructions(input: CreatePaymentGatewayInput) {
  if (input.paymentMethod === PaymentMethod.PIX) {
    return [
      "Abra o app do seu banco e use o codigo PIX abaixo.",
      "O pagamento fica pendente ate a confirmacao do gateway.",
      "O fluxo real do Mercado Pago pode substituir este retorno sem mudar o contrato."
    ];
  }

  return [
    "Simulacao de pagamento com cartao preparada para aprovacao e recusas.",
    "O fluxo real do Mercado Pago deve mapear a mesma resposta de checkout.",
    "Use os campos checkoutUrl e gatewayReference para integrar a experiencia real."
  ];
}

@Injectable()
export class MockPaymentGateway extends PaymentGateway {
  async createPayment(input: CreatePaymentGatewayInput): Promise<PaymentGatewayCreateResult> {
    const gatewayReference = `mock_${randomUUID()}`;
    const externalReference = input.orderNumber;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const checkoutUrl = input.paymentMethod === PaymentMethod.CARD ? `https://mock-pay.local/checkout/${gatewayReference}` : null;
    const qrCodeText =
      input.paymentMethod === PaymentMethod.PIX
        ? `00020126580014BR.GOV.BCB.PIX0136${gatewayReference}5204000053039865802BR5920LOJA RITUAL6009SAO PAULO62070503***6304MOCK`
        : null;

    return {
      provider: "mock",
      gatewayReference,
      externalReference,
      status: PaymentStatus.PENDING,
      checkoutUrl,
      qrCodeText,
      qrCodeBase64:
        input.paymentMethod === PaymentMethod.PIX
          ? Buffer.from(`mock-pix:${gatewayReference}`).toString("base64")
          : null,
      instructions: buildInstructions(input),
      expiresAt,
      raw: {
        provider: "mock",
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        amountCents: input.amountCents,
        paymentMethod: input.paymentMethod,
        metadata: input.metadata
      }
    };
  }

  async getPayment(gatewayReference: string): Promise<PaymentGatewayLookupResult | null> {
    return {
      provider: "mock",
      gatewayReference,
      externalReference: null,
      status: PaymentStatus.PENDING,
      raw: {
        provider: "mock",
        gatewayReference
      }
    };
  }

  async parseWebhook(input: PaymentGatewayWebhookInput): Promise<PaymentGatewayWebhookResult | null> {
    const body = input.body as Record<string, unknown> | null;

    if (!body) {
      return null;
    }

    const gatewayReference = typeof body.id === "string" ? body.id : typeof body.gatewayReference === "string" ? body.gatewayReference : null;

    if (!gatewayReference) {
      return null;
    }

    const externalReference =
      typeof body.external_reference === "string"
        ? body.external_reference
        : typeof body.externalReference === "string"
          ? body.externalReference
          : null;

    return {
      gatewayReference,
      externalReference,
      status: mapWebhookStatus(body.status),
      raw: {
        provider: "mock",
        body,
        headers: input.headers
      }
    };
  }
}
