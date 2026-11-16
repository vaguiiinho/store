import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { DomainError } from "../../../shared/domain/errors/domain-error";
import { MeasurementUnit } from "../../domain/entities/measurement-unit.entity";
import { MeasurementUnitRepository } from "../../domain/repositories/measurement-unit.repository";

type PrismaUnitRecord = { id: string; name: string; abbreviation: string; active: boolean };

@Injectable()
export class PrismaMeasurementUnitRepository implements MeasurementUnitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const unit = await this.prisma.measurementUnit.findUnique({ where: { id } });
    return unit ? this.toEntity(unit) : null;
  }

  async findByAbbreviation(abbreviation: string) {
    const unit = await this.prisma.measurementUnit.findFirst({
      where: { abbreviation: { equals: abbreviation, mode: "insensitive" } }
    });
    return unit ? this.toEntity(unit) : null;
  }

  async findAll() {
    const units = await this.prisma.measurementUnit.findMany({ orderBy: [{ name: "asc" }] });
    return units.map((unit) => this.toEntity(unit));
  }

  async save(unit: MeasurementUnit) {
    try {
      await this.prisma.measurementUnit.upsert({
        where: { id: unit.id },
        create: { id: unit.id, name: unit.name, abbreviation: unit.abbreviation, active: unit.active },
        update: { name: unit.name, abbreviation: unit.abbreviation, active: unit.active }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new DomainError("Ja existe uma unidade com esta sigla.");
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.measurementUnit.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new DomainError("Unidade de medida em uso e nao pode ser excluida. Desative-a.");
      }
      throw error;
    }
  }

  countStocks(id: string) {
    return this.prisma.stock.count({ where: { unitId: id } });
  }

  async countStocksByUnit() {
    const groups = await this.prisma.stock.groupBy({ by: ["unitId"], _count: { _all: true } });
    return Object.fromEntries(groups.map((group) => [group.unitId, group._count._all]));
  }

  private toEntity(unit: PrismaUnitRecord) {
    return MeasurementUnit.create({ id: unit.id, name: unit.name, abbreviation: unit.abbreviation, active: unit.active });
  }
}
