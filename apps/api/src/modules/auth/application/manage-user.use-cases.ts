import { Inject, Injectable } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { USER_REPOSITORY } from "../auth.tokens";
import { isPrimaryAdmin, normalizeEmail, User, UserRole } from "../domain/user";
import { UserRepository } from "../domain/user.repository";
import { MIN_PASSWORD_LENGTH } from "./create-user.use-case";
import { hashPassword, verifyPassword } from "./password-hasher";

const PRIMARY_ADMIN_MESSAGE = "O admin principal e gerido pelo ambiente (ADMIN_EMAIL/ADMIN_PASSWORD).";

function assertPasswordStrength(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new DomainError(`A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }
}

async function findUserOrFail(users: UserRepository, id: string) {
  const user = await users.findById(id);
  if (!user) throw new DomainError("Usuario nao encontrado.");
  return user;
}

/** Qualquer usuario autenticado troca a PROPRIA senha, confirmando a senha atual. */
@Injectable()
export class ChangeOwnPasswordUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(input: { userId: string; currentPassword: string; newPassword: string }): Promise<User> {
    const user = await findUserOrFail(this.users, input.userId);

    if (isPrimaryAdmin(user)) throw new DomainError(PRIMARY_ADMIN_MESSAGE);
    if (!(await verifyPassword(input.currentPassword, user.passwordHash))) throw new DomainError("Senha atual incorreta.");
    assertPasswordStrength(input.newPassword);
    if (input.newPassword === input.currentPassword) throw new DomainError("A nova senha deve ser diferente da atual.");

    return this.users.updatePassword(user.id, await hashPassword(input.newPassword));
  }
}

/** Admin redefine a senha de outro usuario (ex.: esqueceu a senha). */
@Injectable()
export class AdminSetUserPasswordUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(input: { actorId: string; userId: string; newPassword: string }): Promise<User> {
    if (input.actorId === input.userId) throw new DomainError("Para a sua propria senha use a tela Minha conta.");
    const user = await findUserOrFail(this.users, input.userId);

    if (isPrimaryAdmin(user)) throw new DomainError(PRIMARY_ADMIN_MESSAGE);
    assertPasswordStrength(input.newPassword);

    return this.users.updatePassword(user.id, await hashPassword(input.newPassword));
  }
}

/** Admin ativa/desativa usuarios. Desativar derruba as sessoes na hora (o guard confere `active`). */
@Injectable()
export class SetUserActiveUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(input: { actorId: string; userId: string; active: boolean }): Promise<User> {
    if (input.actorId === input.userId) throw new DomainError("Voce nao pode desativar a sua propria conta.");
    const user = await findUserOrFail(this.users, input.userId);

    if (isPrimaryAdmin(user)) throw new DomainError(PRIMARY_ADMIN_MESSAGE);

    return user.active === input.active ? user : this.users.update(user.id, { active: input.active });
  }
}

export type UpdateUserInput = {
  actorId: string;
  userId: string;
  name?: string;
  email?: string;
  role?: UserRole;
};

/**
 * Admin edita nome, e-mail e papel.
 * - Ninguem altera o proprio papel (evita um admin se rebaixar e perder o acesso).
 * - Do admin principal so o nome pode mudar: e-mail e papel vem do ambiente.
 */
@Injectable()
export class UpdateUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<User> {
    const user = await findUserOrFail(this.users, input.userId);
    const data: Partial<Pick<User, "name" | "email" | "role">> = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new DomainError("Informe o nome do usuario.");
      if (name !== user.name) data.name = name;
    }

    if (input.email !== undefined) {
      const email = normalizeEmail(input.email);
      if (email !== user.email) {
        if (isPrimaryAdmin(user)) throw new DomainError(PRIMARY_ADMIN_MESSAGE);
        const owner = await this.users.findByEmail(email);
        if (owner && owner.id !== user.id) throw new DomainError("Ja existe um usuario com este e-mail.");
        data.email = email;
      }
    }

    if (input.role !== undefined && input.role !== user.role) {
      if (!Object.values(UserRole).includes(input.role)) throw new DomainError("Papel de usuario invalido.");
      if (input.actorId === user.id) throw new DomainError("Voce nao pode alterar o seu proprio papel.");
      if (isPrimaryAdmin(user)) throw new DomainError(PRIMARY_ADMIN_MESSAGE);
      data.role = input.role;
    }

    return Object.keys(data).length ? this.users.update(user.id, data) : user;
  }
}

/** Admin exclui usuarios. Nao exclui a si mesmo nem o admin principal; pedidos ficam preservados sem dono. */
@Injectable()
export class DeleteUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(input: { actorId: string; userId: string }): Promise<void> {
    if (input.actorId === input.userId) throw new DomainError("Voce nao pode excluir a sua propria conta.");
    const user = await findUserOrFail(this.users, input.userId);
    if (isPrimaryAdmin(user)) throw new DomainError(PRIMARY_ADMIN_MESSAGE);
    await this.users.delete(user.id);
  }
}
