import { DomainError } from "../../../shared/domain/errors/domain-error";
import {
  IN_PROGRESS_ORDER_STATUSES,
  OrderStatus,
  PENDING_PAYMENT_ORDER_STATUSES,
  REVENUE_ORDER_STATUSES
} from "../../domain/entities/order.entity";
import { OrderRepository } from "../../domain/repositories/order.repository";

export type Clock = () => Date;

export type GetAdminOrderSummaryInput = { periodDays: number };

export type GetAdminOrderSummaryOutput = {
  totalOrders: number;
  awaitingPayment: number;
  inProgress: number;
  delivered: number;
  cancelled: number;
  revenueCents: number;
  periodDays: number;
  periodStart: string;
  ordersInPeriod: number;
};

const MAX_PERIOD_DAYS = 365;
const DAY_IN_MS = 86_400_000;

export class GetAdminOrderSummaryUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly clock: Clock
  ) {}

  async execute(input: GetAdminOrderSummaryInput): Promise<GetAdminOrderSummaryOutput> {
    const { periodDays } = input;

    if (!Number.isInteger(periodDays) || periodDays < 1 || periodDays > MAX_PERIOD_DAYS) {
      throw new DomainError("Periodo invalido.");
    }

    const since = new Date(this.clock().getTime() - periodDays * DAY_IN_MS);
    const snapshot = await this.orderRepository.summarize(since);

    const countOf = (statuses: readonly OrderStatus[]) =>
      snapshot.byStatus.filter((row) => statuses.includes(row.status)).reduce((sum, row) => sum + row.count, 0);

    return {
      totalOrders: snapshot.byStatus.reduce((sum, row) => sum + row.count, 0),
      awaitingPayment: countOf(PENDING_PAYMENT_ORDER_STATUSES),
      inProgress: countOf(IN_PROGRESS_ORDER_STATUSES),
      delivered: countOf([OrderStatus.DELIVERED]),
      cancelled: countOf([OrderStatus.CANCELLED]),
      revenueCents: snapshot.byStatus
        .filter((row) => REVENUE_ORDER_STATUSES.includes(row.status))
        .reduce((sum, row) => sum + row.totalCents, 0),
      periodDays,
      periodStart: since.toISOString(),
      ordersInPeriod: snapshot.createdSince
    };
  }
}
