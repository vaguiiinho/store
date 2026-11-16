import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { DomainError } from "../../../shared/domain/errors/domain-error";
import { MeasurementUnit } from "../../domain/entities/measurement-unit.entity";
import { Stock } from "../../domain/entities/stock.entity";
import { StockRepository } from "../../domain/repositories/stock.repository";

type PrismaStockRecord = {
  id: string;
  productId: string;
  variantId: string | null;
  availableQuantity: number;
  reservedQuantity: number;
  unit: { id: string; name: string; abbreviation: string; active: boolean };
};

const withUnit = { unit: true } as const;

@Injectable()
export class PrismaStockRepository implements StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductId(productId: string) {
    const stock = await this.prisma.stock.findFirst({
      where: {
        productId,
        variantId: null
      },
      include: withUnit
    });

    return stock ? this.toEntity(stock) : null;
  }

  async findByProductAndVariant(productId: string, variantId?: string | null) {
    if (!variantId) {
      return this.findByProductId(productId);
    }

    const stock = await this.prisma.stock.findFirst({
      where: {
        productId,
        variantId
      },
      include: withUnit
    });

    return stock ? this.toEntity(stock) : null;
  }

  async reserve(productId: string, variantId: string | null, quantity: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    const stock = await this.findByProductAndVariant(productId, variantId);

    if (!stock) {
      throw new DomainError("Estoque nao encontrado.");
    }

    const result = await client.stock.updateMany({
      where: {
        id: stock.id,
        availableQuantity: {
          gte: quantity
        }
      },
      data: {
        availableQuantity: {
          decrement: quantity
        },
        reservedQuantity: {
          increment: quantity
        }
      }
    });

    if (result.count === 0) {
      throw new DomainError("Estoque insuficiente para reserva.");
    }

    const updatedStock = await client.stock.findUnique({
      where: { id: stock.id },
      include: withUnit
    });

    if (!updatedStock) {
      throw new DomainError("Estoque nao encontrado.");
    }

    return this.toEntity(updatedStock);
  }

  async release(productId: string, variantId: string | null, quantity: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    const stock = await this.findByProductAndVariant(productId, variantId);

    if (!stock) {
      throw new DomainError("Estoque nao encontrado.");
    }

    const result = await client.stock.updateMany({
      where: {
        id: stock.id,
        reservedQuantity: {
          gte: quantity
        }
      },
      data: {
        availableQuantity: {
          increment: quantity
        },
        reservedQuantity: {
          decrement: quantity
        }
      }
    });

    if (result.count === 0) {
      throw new DomainError("Nao ha estoque reservado suficiente.");
    }

    const updatedStock = await client.stock.findUnique({
      where: { id: stock.id },
      include: withUnit
    });

    if (!updatedStock) {
      throw new DomainError("Estoque nao encontrado.");
    }

    return this.toEntity(updatedStock);
  }

  async save(stock: Stock, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    await client.stock.upsert({
      where: { id: stock.id },
      create: {
        id: stock.id,
        productId: stock.productId,
        variantId: stock.variantId,
        unitId: stock.unit.id,
        availableQuantity: stock.available,
        reservedQuantity: stock.reserved
      },
      update: {
        availableQuantity: stock.available,
        reservedQuantity: stock.reserved
      }
    });
  }

  async changeUnit(stockId: string, unitId: string) {
    await this.prisma.stock.update({ where: { id: stockId }, data: { unitId } });
  }

  async adjustAvailable(productId: string, variantId: string | null, delta: number) {
    const stock = await this.findByProductAndVariant(productId, variantId);
    if (!stock) throw new DomainError("Estoque nao encontrado.");
    // Valida a regra no dominio e aplica o ajuste de forma atomica: um save() a partir desta
    // leitura sobrescreveria reservas feitas em paralelo pelo checkout.
    stock.adjustAvailable(delta);
    const result = await this.prisma.stock.updateMany({
      where: { id: stock.id, ...(delta < 0 ? { availableQuantity: { gte: -delta } } : {}) },
      data: { availableQuantity: { increment: delta } }
    });
    if (result.count === 0) throw new DomainError("Estoque insuficiente para esta retirada.");
    const updated = await this.prisma.stock.findUnique({ where: { id: stock.id }, include: withUnit });
    if (!updated) throw new DomainError("Estoque nao encontrado.");
    return this.toEntity(updated);
  }

  private toEntity(stock: PrismaStockRecord) {
    return Stock.create({
      id: stock.id,
      productId: stock.productId,
      variantId: stock.variantId,
      availableQuantity: stock.availableQuantity,
      reservedQuantity: stock.reservedQuantity,
      unit: MeasurementUnit.create(stock.unit)
    });
  }
}
