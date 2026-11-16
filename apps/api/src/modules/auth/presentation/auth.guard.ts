import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../application/auth.service";
import { IS_PUBLIC_KEY, ROLES_KEY } from "../auth.tokens";
import { UserRole } from "../domain/user";
import { AuthenticatedRequest } from "./decorators";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext) {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets);
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (isPublic) {
      return true;
    }

    const user = await this.authService.authenticate(request.headers.cookie);

    if (!user) {
      throw new UnauthorizedException("Autenticacao necessaria.");
    }

    request.user = user;

    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, targets);

    if (roles?.length && user.role !== UserRole.ADMIN && !roles.includes(user.role)) {
      throw new ForbiddenException("Acesso negado.");
    }

    return true;
  }
}
