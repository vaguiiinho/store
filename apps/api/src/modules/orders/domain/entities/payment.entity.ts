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
};

export class Payment {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public method: PaymentMethod,
    public amountCents: number,
    public status: PaymentStatus = PaymentStatus.PENDING,
    public externalReference: string | null = null,
    public gatewayReference: string | null = null
  ) {}

  static create(props: PaymentProps) {
    return new Payment(
      props.id,
      props.orderId,
      props.method,
      props.amountCents,
      props.status ?? PaymentStatus.PENDING,
      props.externalReference ?? null,
      props.gatewayReference ?? null
    );
  }

  markPaid() {
    this.status = PaymentStatus.PAID;
  }

  markDeclined() {
    this.status = PaymentStatus.DECLINED;
  }
}
