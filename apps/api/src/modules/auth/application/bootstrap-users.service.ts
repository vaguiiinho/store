import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { USER_REPOSITORY } from "../auth.tokens";
import { normalizeEmail, UserRole } from "../domain/user";
import { UserRepository } from "../domain/user.repository";
import { hashPassword, verifyPassword } from "./password-hasher";

type SeedUser = { name: string; email: string; password: string; role: UserRole };

/**
 * Garante os usuarios definidos por ambiente a cada inicializacao:
 * - ADMIN_EMAIL / ADMIN_PASSWORD (obrigatorios): o .env e a fonte da verdade do admin principal
 *   (senha e papel sao sincronizados se mudarem).
 * - DEMO_USER_EMAIL / DEMO_USER_PASSWORD (opcionais): usuario demo com papel USER.
 */
@Injectable()
export class BootstrapUsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapUsersService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async onApplicationBootstrap() {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, DEMO_USER_EMAIL, DEMO_USER_PASSWORD, DEMO_USER_NAME } = process.env;

    if (!process.env.AUTH_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("AUTH_SECRET, ADMIN_EMAIL e ADMIN_PASSWORD devem estar configurados.");
    }

    await this.ensure({ name: ADMIN_NAME || "Administrador", email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: UserRole.ADMIN });

    if (DEMO_USER_EMAIL && DEMO_USER_PASSWORD) {
      await this.ensure({ name: DEMO_USER_NAME || "Usuario Demo", email: DEMO_USER_EMAIL, password: DEMO_USER_PASSWORD, role: UserRole.USER });
    }
  }

  private async ensure(seed: SeedUser) {
    const email = normalizeEmail(seed.email);
    const existing = await this.userRepository.findByEmail(email);

    if (!existing) {
      await this.userRepository.create({ name: seed.name, email, role: seed.role, passwordHash: await hashPassword(seed.password) });
      this.logger.log(`Usuario ${seed.role} criado a partir do ambiente.`);
      return;
    }

    const passwordMatches = await verifyPassword(seed.password, existing.passwordHash);

    if (!passwordMatches) {
      await this.userRepository.updatePassword(existing.id, await hashPassword(seed.password));
    }

    if (!passwordMatches || existing.role !== seed.role || !existing.active) {
      await this.userRepository.update(existing.id, { role: seed.role, active: true });
      this.logger.log(`Usuario ${seed.role} sincronizado com o ambiente.`);
    }
  }
}
