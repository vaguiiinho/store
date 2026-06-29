import { PaymentMethod, PaymentStatus } from "../../orders/domain/entities/payment.entity";

export type PaymentGatewayProvider = "mock" | "mercado_pago";

export type PaymentGatewayCustomer = {
  name: string;
  email: string | null;
  phone: string;
  document: string | null;
};

export type PaymentGatewayAddress = {
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  reference: string | null;
};

export type PaymentGatewayItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  variantId: string | null;
};

export type CreatePaymentGatewayInput = {
  orderId: string;
  orderNumber: string;
  amountCents: number;
  paymentMethod: PaymentMethod;
  customer: PaymentGatewayCustomer;
  shippingAddress: PaymentGatewayAddress;
  items: PaymentGatewayItem[];
  returnUrl: string | null;
  webhookUrl: string | null;
  metadata: Record<string, unknown>;
};

export type PaymentGatewayWebhookInput = {
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
};

export type PaymentGatewayWebhookResult = {
  gatewayReference: string;
  externalReference: string | null;
  status: PaymentStatus;
  raw: Record<string, unknown>;
};

export type PaymentGatewayCreateResult = {
  provider: PaymentGatewayProvider;
  gatewayReference: string;
  externalReference: string;
  status: PaymentStatus;
  checkoutUrl: string | null;
  qrCodeText: string | null;
  qrCodeBase64: string | null;
  instructions: string[];
  expiresAt: Date | null;
  raw: Record<string, unknown>;
};

export type PaymentGatewayLookupResult = {
  provider: PaymentGatewayProvider;
  gatewayReference: string;
  externalReference: string | null;
  status: PaymentStatus;
  raw: Record<string, unknown>;
};

export abstract class PaymentGateway {
  abstract createPayment(input: CreatePaymentGatewayInput): Promise<PaymentGatewayCreateResult>;
  abstract getPayment(gatewayReference: string): Promise<PaymentGatewayLookupResult | null>;
  abstract parseWebhook(input: PaymentGatewayWebhookInput): Promise<PaymentGatewayWebhookResult | null>;
}
