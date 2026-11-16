import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import { IS_PUBLIC_KEY, ROLES_KEY } from "../auth.tokens";
import { AuthenticatedUser, UserRole } from "../domain/user";

export type AuthenticatedRequest = { headers: { cookie?: string }; user?: AuthenticatedUser | null };

/** Rota sem autenticacao (o guard global exige sessao por padrao). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Restringe a rota aos papeis informados. ADMIN sempre tem acesso total. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const AdminOnly = () => Roles(UserRole.ADMIN);

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest<AuthenticatedRequest>().user ?? null;
});
