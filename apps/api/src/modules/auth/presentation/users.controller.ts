import { BadRequestException, Body, Controller, Delete, Get, Inject, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { CreateUserUseCase } from "../application/create-user.use-case";
import { USER_REPOSITORY } from "../auth.tokens";
import { AuthenticatedUser, isPrimaryAdmin, User } from "../domain/user";
import { AdminSetUserPasswordUseCase, DeleteUserUseCase, SetUserActiveUseCase, UpdateUserUseCase } from "../application/manage-user.use-cases";
import { UserRepository } from "../domain/user.repository";
import { AdminOnly, CurrentUser } from "./decorators";
import { AdminSetPasswordDto, CreateUserDto, SetUserActiveDto, UpdateUserDto } from "./dto/auth.dto";

function serializeUser(user: User) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active, primaryAdmin: isPrimaryAdmin(user), createdAt: user.createdAt };
}

@AdminOnly()
@Controller("admin/users")
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly setUserActiveUseCase: SetUserActiveUseCase,
    private readonly adminSetUserPasswordUseCase: AdminSetUserPasswordUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  @Get()
  async list() {
    return (await this.userRepository.findAll()).map(serializeUser);
  }

  @Get(":id")
  async get(@Param("id", ParseUUIDPipe) id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("Usuario nao encontrado.");
    return serializeUser(user);
  }

  @Patch(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateUserDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.run(() => this.updateUserUseCase.execute({ actorId: actor.id, userId: id, ...body }));
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser) {
    try {
      await this.deleteUserUseCase.execute({ actorId: actor.id, userId: id });
      return { deleted: true };
    } catch (error) {
      if (error instanceof DomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Post()
  async create(@Body() body: CreateUserDto) {
    return this.run(() => this.createUserUseCase.execute(body));
  }

  @Patch(":id/status")
  async setActive(@Param("id", ParseUUIDPipe) id: string, @Body() body: SetUserActiveDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.run(() => this.setUserActiveUseCase.execute({ actorId: actor.id, userId: id, active: body.active }));
  }

  @Patch(":id/password")
  async setPassword(@Param("id", ParseUUIDPipe) id: string, @Body() body: AdminSetPasswordDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.run(() => this.adminSetUserPasswordUseCase.execute({ actorId: actor.id, userId: id, newPassword: body.newPassword }));
  }

  private async run(action: () => Promise<User>) {
    try {
      return serializeUser(await action());
    } catch (error) {
      if (error instanceof DomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }
}
