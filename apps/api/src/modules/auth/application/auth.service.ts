import { Inject, Injectable } from "@nestjs/common";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, USER_REPOSITORY } from "../auth.tokens";
import { AuthenticatedUser, normalizeEmail, User } from "../domain/user";
import { UserRepository } from "../domain/user.repository";
import { DUMMY_PASSWORD_HASH, verifyPassword } from "./password-hasher";
import { decodeSessionToken, encodeSessionToken, readCookie } from "./session-token";

export type LoginResult = {
  user: AuthenticatedUser;
  cookie: string;
  expiresAt: Date;
};

function toAuthenticatedUser(user: AuthenticatedUser): AuthenticatedUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  private get secret() {
    const secret = process.env.AUTH_SECRET ?? "";

    if (!secret) {
      throw new Error("AUTH_SECRET deve estar configurado.");
    }

    return secret;
  }

  async login(email: string, password: string): Promise<LoginResult | null> {
    const user = await this.userRepository.findByEmail(normalizeEmail(email));
    const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

    if (!user || !valid || !user.active) {
      return null;
    }

    return this.issueSession(user);
  }

  /** Emite um cookie novo (usado no login e apos trocar a propria senha). */
  issueSession(user: User): LoginResult {
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    const token = encodeSessionToken(this.secret, { sub: user.id, role: user.role, ver: user.sessionVersion, exp: Math.floor(expiresAt.getTime() / 1000) });

    return {
      user: toAuthenticatedUser(user),
      cookie: this.buildCookie(token, SESSION_MAX_AGE_SECONDS),
      expiresAt
    };
  }

  /** Valida assinatura/expiracao e recarrega o usuario: desativacao ou troca de papel valem na hora. */
  async authenticate(cookieHeader?: string | null): Promise<AuthenticatedUser | null> {
    const token = readCookie(cookieHeader, SESSION_COOKIE_NAME);
    const payload = token ? decodeSessionToken(this.secret, token) : null;

    if (!payload) {
      return null;
    }

    const user = await this.userRepository.findById(payload.sub);
    return user?.active && user.sessionVersion === payload.ver ? toAuthenticatedUser(user) : null;
  }

  logoutCookie() {
    return this.buildCookie("", 0);
  }

  private buildCookie(value: string, maxAge: number) {
    const secure = process.env.NODE_ENV === "production" && (process.env.APP_URL ?? "").startsWith("https://") ? "; Secure" : "";
    return `${SESSION_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
  }
}
