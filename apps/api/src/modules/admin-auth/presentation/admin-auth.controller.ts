import { Body, Controller, Get, Headers, Post, Res } from "@nestjs/common";
import { AdminAuthService } from "../admin-auth.service";
import { IsEmail, IsString, MinLength } from "class-validator";

class AdminLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

type HeaderResponse = {
  setHeader: (name: string, value: string) => void;
};

@Controller("admin/auth")
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post("login")
  async login(@Body() body: AdminLoginDto, @Res({ passthrough: true }) response: HeaderResponse) {
    const session = this.adminAuthService.login(body.email, body.password);

    if (!session) {
      return {
        authenticated: false
      };
    }

    response.setHeader("Set-Cookie", session.cookie);

    return {
      authenticated: true,
      email: session.email,
      expiresAt: session.expiresAt
    };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: HeaderResponse) {
    response.setHeader("Set-Cookie", this.adminAuthService.logoutCookie());

    return {
      authenticated: false
    };
  }

  @Get("me")
  me(@Headers("cookie") cookieHeader?: string) {
    const session = this.adminAuthService.verifyCookie(cookieHeader);

    if (!session) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      email: session.email,
      role: session.role
    };
  }
}
