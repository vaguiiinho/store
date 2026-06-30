import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { DomainError } from "../../../shared/domain/errors/domain-error";
import { Stock } from "../../domain/entities/stock.entity";
import { StockRepository } from "../../domain/repositories/stock.repository";

type PrismaStockRecord = {
  id: string;
  productId: string;
  variantId: string | null;
  availableQuantity: number;
  reservedQuantity: number;
};

@Injectable()
export class PrismaStockRepository implements StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductId(productId: string) {
    const stock = await this.prisma.stock.findFirst({
      where: {
        productId,
        variantId: null
      }
    });

    return stock ? this.toEntity(stock as PrismaStockRecord) : null;
  }

  async findByProductAndVariant(productId: string, variantId?: string | null) {
    if (!variantId) {
      return this.findByProductId(productId);
    }

    const stock = await this.prisma.stock.findFirst({
      where: {
        productId,
        variantId
      }
    });

    return stock ? this.toEntity(stock as PrismaStockRecord) : null;
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
      where: { id: stock.id }
    });

    if (!updatedStock) {
      throw new DomainError("Estoque nao encontrado.");
    }

    return this.toEntity(updatedStock as PrismaStockRecord);
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
      where: { id: stock.id }
    });

    if (!updatedStock) {
      throw new DomainError("Estoque nao encontrado.");
    }

    return this.toEntity(updatedStock as PrismaStockRecord);
  }

  async save(stock: Stock, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    await client.stock.upsert({
      where: { id: stock.id },
      create: {
        id: stock.id,
        productId: stock.productId,
        variantId: stock.variantId,
        availableQuantity: stock.available,
        reservedQuantity: stock.reserved
      },
      update: {
        availableQuantity: stock.available,
        reservedQuantity: stock.reserved
      }
    });
  }

  private toEntity(stock: PrismaStockRecord) {
    return Stock.create({
      id: stock.id,
      productId: stock.productId,
      variantId: stock.variantId,
      availableQuantity: stock.availableQuantity,
      reservedQuantity: stock.reservedQuantity
    });
  }
}
