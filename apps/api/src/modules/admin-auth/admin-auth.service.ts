import { Injectable } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";
import { ADMIN_AUTH_COOKIE_NAME } from "./admin-auth.tokens";

type AdminSessionPayload = {
  email: string;
  role: "admin";
  exp: number;
};

type LoginResult = {
  cookie: string;
  expiresAt: Date;
  email: string;
};

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

@Injectable()
export class AdminAuthService {
  private readonly authSecret = process.env.AUTH_SECRET ?? "";
  private readonly adminEmail = process.env.ADMIN_EMAIL ?? "";
  private readonly adminPassword = process.env.ADMIN_PASSWORD ?? "";

  login(email: string, password: string): LoginResult | null {
    if (!this.authSecret || !this.adminEmail || !this.adminPassword) {
      throw new Error("AUTH_SECRET, ADMIN_EMAIL e ADMIN_PASSWORD devem estar configurados.");
    }

    if (email.trim().toLowerCase() !== this.adminEmail.trim().toLowerCase()) {
      return null;
    }

    if (!safeEqual(password, this.adminPassword)) {
      return null;
    }

    const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE_SECONDS * 1000);
    const payload: AdminSessionPayload = {
      email: this.adminEmail,
      role: "admin",
      exp: Math.floor(expiresAt.getTime() / 1000)
    };
    const token = this.encodePayload(payload);

    return {
      cookie: this.buildCookie(token, expiresAt),
      expiresAt,
      email: this.adminEmail
    };
  }

  logoutCookie() {
    return `${ADMIN_AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  }

  verifyCookie(cookieHeader?: string | null) {
    const token = this.extractToken(cookieHeader);

    if (!token || !this.authSecret) {
      return null;
    }

    try {
      const [payloadPart, signaturePart] = token.split(".");

      if (!payloadPart || !signaturePart) {
        return null;
      }

      const expectedSignature = this.sign(payloadPart);

      if (!safeEqual(signaturePart, expectedSignature)) {
        return null;
      }

      const payload = JSON.parse(base64UrlDecode(payloadPart)) as AdminSessionPayload;

      if (payload.role !== "admin") {
        return null;
      }

      if (payload.exp * 1000 < Date.now()) {
        return null;
      }

      return {
        email: payload.email,
        role: payload.role
      };
    } catch {
      return null;
    }
  }

  private extractToken(cookieHeader?: string | null) {
    if (!cookieHeader) {
      return null;
    }

    const cookie = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${ADMIN_AUTH_COOKIE_NAME}=`));

    if (!cookie) {
      return null;
    }

    return cookie.slice(`${ADMIN_AUTH_COOKIE_NAME}=`.length);
  }

  private encodePayload(payload: AdminSessionPayload) {
    const payloadPart = base64UrlEncode(JSON.stringify(payload));
    const signaturePart = this.sign(payloadPart);

    return `${payloadPart}.${signaturePart}`;
  }

  private sign(payloadPart: string) {
    return createHmac("sha256", this.authSecret).update(payloadPart).digest("base64url");
  }

  private buildCookie(token: string, expiresAt: Date) {
    const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

    return `${ADMIN_AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
  }
}
