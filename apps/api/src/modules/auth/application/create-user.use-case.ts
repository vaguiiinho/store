import { Inject, Injectable } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { USER_REPOSITORY } from "../auth.tokens";
import { normalizeEmail, User, UserRole } from "../domain/user";
import { UserRepository } from "../domain/user.repository";
import { hashPassword } from "./password-hasher";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export const MIN_PASSWORD_LENGTH = 8;

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const name = input.name.trim();
    const email = normalizeEmail(input.email);

    if (!name) throw new DomainError("Informe o nome do usuario.");
    if (input.password.length < MIN_PASSWORD_LENGTH) throw new DomainError(`A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    if (!Object.values(UserRole).includes(input.role)) throw new DomainError("Papel de usuario invalido.");
    if (await this.userRepository.findByEmail(email)) throw new DomainError("Ja existe um usuario com este e-mail.");

    return this.userRepository.create({ name, email, role: input.role, passwordHash: await hashPassword(input.password) });
  }
}
