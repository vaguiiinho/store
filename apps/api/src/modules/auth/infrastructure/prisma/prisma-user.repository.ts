import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { User, UserRole } from "../../domain/user";
import { CreateUserData, UserRepository } from "../../domain/user.repository";

type PrismaUserRecord = Omit<User, "role"> & { role: string };

function mapUser(record: PrismaUserRecord): User {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    passwordHash: record.passwordHash,
    role: record.role as UserRole,
    active: record.active,
    sessionVersion: record.sessionVersion,
    createdAt: record.createdAt
  };
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? mapUser(user) : null;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? mapUser(user) : null;
  }

  async findAll(limit = 100) {
    const users = await this.prisma.user.findMany({ orderBy: [{ createdAt: "desc" }], take: limit });
    return users.map(mapUser);
  }

  async create(data: CreateUserData) {
    return mapUser(await this.prisma.user.create({ data }));
  }

  async updatePassword(id: string, passwordHash: string) {
    return mapUser(await this.prisma.user.update({ where: { id }, data: { passwordHash, sessionVersion: { increment: 1 } } }));
  }

  async delete(id: string) {
    // Pedidos do usuario sao preservados (Order.userId vira NULL pela FK ON DELETE SET NULL).
    await this.prisma.user.delete({ where: { id } });
  }

  async update(id: string, data: Partial<Pick<User, "name" | "email" | "passwordHash" | "role" | "active">>) {
    return mapUser(await this.prisma.user.update({ where: { id }, data }));
  }
}
