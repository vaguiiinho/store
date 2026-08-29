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
  id?: string;
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
    if (!Object.values(PaymentMethod).includes(props.method)) throw new DomainError("Metodo de pagamento invalido.");
    if (props.status && !Object.values(PaymentStatus).includes(props.status)) throw new DomainError("Status de pagamento invalido.");

    return new Payment(
      EntityId.create(props.id, "ID do pagamento").value,
      EntityId.create(props.orderId, "ID do pedido").value,
      props.method,
      Money.create(props.amountCents, "Valor do pagamento").cents,
      props.status ?? PaymentStatus.PENDING,
      props.externalReference ?? null,
      props.gatewayReference ?? null,
      props.provider ?? null,
      props.checkoutUrl ?? null,
      props.qrCodeText ?? null,
      props.qrCodeBase64 ?? null,
      (props.instructions ?? []).map((instruction) => instruction.trim()).filter(Boolean),
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
import { DomainError } from "../../../shared/domain/errors/domain-error";
import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";
import { Money } from "../../../shared/domain/value-objects/money.value-object";
