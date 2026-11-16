import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { AuthService } from "./application/auth.service";
import { BootstrapUsersService } from "./application/bootstrap-users.service";
import { CreateUserUseCase } from "./application/create-user.use-case";
import { AdminSetUserPasswordUseCase, ChangeOwnPasswordUseCase, DeleteUserUseCase, SetUserActiveUseCase, UpdateUserUseCase } from "./application/manage-user.use-cases";
import { USER_REPOSITORY } from "./auth.tokens";
import { PrismaUserRepository } from "./infrastructure/prisma/prisma-user.repository";
import { AuthController } from "./presentation/auth.controller";
import { AuthGuard } from "./presentation/auth.guard";
import { UsersController } from "./presentation/users.controller";

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    CreateUserUseCase,
    ChangeOwnPasswordUseCase,
    AdminSetUserPasswordUseCase,
    SetUserActiveUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    BootstrapUsersService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: APP_GUARD, useClass: AuthGuard }
  ],
  exports: [AuthService]
})
export class AuthModule {}
