import { BadRequestException, Body, Controller, Get, Headers, HttpCode, Patch, Post, Res, UnauthorizedException } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { ChangeOwnPasswordUseCase } from "../application/manage-user.use-cases";
import { AuthenticatedUser, isPrimaryAdmin } from "../domain/user";
import { AuthService } from "../application/auth.service";
import { ChangeOwnPasswordDto, LoginDto } from "./dto/auth.dto";
import { CurrentUser, Public } from "./decorators";

type HeaderResponse = {
  setHeader: (name: string, value: string) => void;
};

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly changeOwnPasswordUseCase: ChangeOwnPasswordUseCase
  ) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: HeaderResponse) {
    const session = await this.authService.login(body.email, body.password);

    if (!session) {
      throw new UnauthorizedException("E-mail ou senha invalidos.");
    }

    response.setHeader("Set-Cookie", session.cookie);

    return { authenticated: true, user: session.user, expiresAt: session.expiresAt };
  }

  @Public()
  @Post("logout")
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: HeaderResponse) {
    response.setHeader("Set-Cookie", this.authService.logoutCookie());
    return { authenticated: false };
  }

  @Public()
  @Get("me")
  async me(@Headers("cookie") cookieHeader?: string) {
    const user = await this.authService.authenticate(cookieHeader);
    return user ? { authenticated: true, user: { ...user, primaryAdmin: isPrimaryAdmin(user) } } : { authenticated: false };
  }

  /** Troca a propria senha. Sessoes antigas caem; a sessao atual recebe um cookie novo. */
  @Patch("password")
  async changePassword(
    @Body() body: ChangeOwnPasswordDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: HeaderResponse
  ) {
    try {
      const updated = await this.changeOwnPasswordUseCase.execute({ userId: user.id, currentPassword: body.currentPassword, newPassword: body.newPassword });
      response.setHeader("Set-Cookie", this.authService.issueSession(updated).cookie);
      return { changed: true };
    } catch (error) {
      if (error instanceof DomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }
}
