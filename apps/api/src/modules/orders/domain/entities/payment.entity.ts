export enum PaymentMethod {
  PIX = "PIX",
  CARD = "CARD"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED"
}

export type PaymentProps = {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amountCents: number;
  status?: PaymentStatus;
  externalReference?: string | null;
  gatewayReference?: string | null;
  provider?: string | null;
  checkoutUrl?: string | null;
  qrCodeText?: string | null;
  qrCodeBase64?: string | null;
  instructions?: string[];
  expiresAt?: Date | null;
};

export class Payment {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public method: PaymentMethod,
    public amountCents: number,
    public status: PaymentStatus = PaymentStatus.PENDING,
    public externalReference: string | null = null,
    public gatewayReference: string | null = null,
    public provider: string | null = null,
    public checkoutUrl: string | null = null,
    public qrCodeText: string | null = null,
    public qrCodeBase64: string | null = null,
    public instructions: string[] = [],
    public expiresAt: Date | null = null
  ) {}

  static create(props: PaymentProps) {
    return new Payment(
      props.id,
      props.orderId,
      props.method,
      props.amountCents,
      props.status ?? PaymentStatus.PENDING,
      props.externalReference ?? null,
      props.gatewayReference ?? null,
      props.provider ?? null,
      props.checkoutUrl ?? null,
      props.qrCodeText ?? null,
      props.qrCodeBase64 ?? null,
      props.instructions ?? [],
      props.expiresAt ?? null
    );
  }

  markPaid() {
    this.status = PaymentStatus.PAID;
  }

  markDeclined() {
    this.status = PaymentStatus.DECLINED;
  }
}
