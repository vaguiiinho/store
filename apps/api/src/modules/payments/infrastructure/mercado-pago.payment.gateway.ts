import { Injectable } from "@nestjs/common";
import {
  CreatePaymentGatewayInput,
  PaymentGateway,
  PaymentGatewayCreateResult,
  PaymentGatewayLookupResult,
  PaymentGatewayWebhookInput,
  PaymentGatewayWebhookResult
} from "../domain/payment-gateway";

type MercadoPagoGatewayConfig = {
  accessToken: string;
  publicKey: string;
  webhookSecret: string;
  baseUrl: string;
};

function readConfig(): MercadoPagoGatewayConfig {
  return {
    accessToken: process.env.PAYMENT_PROVIDER_SECRET ?? "",
    publicKey: process.env.PAYMENT_PROVIDER_KEY ?? "",
    webhookSecret: process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET ?? "",
    baseUrl: process.env.PAYMENT_PROVIDER_BASE_URL ?? "https://api.mercadopago.com"
  };
}

function ensureConfig(config: MercadoPagoGatewayConfig) {
  const missing: string[] = [];

  if (!config.accessToken) missing.push("PAYMENT_PROVIDER_SECRET");
  if (!config.publicKey) missing.push("PAYMENT_PROVIDER_KEY");

  if (missing.length > 0) {
    throw new Error(`Mercado Pago gateway nao configurado. Faltam: ${missing.join(", ")}`);
  }
}

@Injectable()
export class MercadoPagoPaymentGateway extends PaymentGateway {
  private readonly config = readConfig();

  async createPayment(_input: CreatePaymentGatewayInput): Promise<PaymentGatewayCreateResult> {
    ensureConfig(this.config);

    throw new Error(
      "Adapter Mercado Pago ainda sem chamada HTTP real. O contrato e a selecao do provedor ja estao prontos."
    );
  }

  async getPayment(_gatewayReference: string): Promise<PaymentGatewayLookupResult | null> {
    ensureConfig(this.config);

    throw new Error(
      "Consulta Mercado Pago ainda nao implementada. O adapter esta preparado para receber a integracao real."
    );
  }

  async parseWebhook(_input: PaymentGatewayWebhookInput): Promise<PaymentGatewayWebhookResult | null> {
    ensureConfig(this.config);

    throw new Error(
      "Parser de webhook Mercado Pago ainda nao implementado. O endpoint e o contrato interno ja estao definidos."
    );
  }
}
