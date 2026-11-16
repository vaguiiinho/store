import { createHmac, timingSafeEqual } from "node:crypto";
import { UserRole } from "../domain/user";

export type SessionPayload = {
  sub: string;
  role: UserRole;
  ver: number;
  exp: number;
};

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(secret: string, payloadPart: string) {
  return createHmac("sha256", secret).update(payloadPart).digest("base64url");
}

export function encodeSessionToken(secret: string, payload: SessionPayload) {
  const payloadPart = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${payloadPart}.${sign(secret, payloadPart)}`;
}

export function decodeSessionToken(secret: string, token: string, now = Date.now()): SessionPayload | null {
  const [payloadPart, signaturePart, extra] = token.split(".");

  if (!secret || !payloadPart || !signaturePart || extra !== undefined) {
    return null;
  }

  if (!safeEqual(signaturePart, sign(secret, payloadPart))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as SessionPayload;

    if (typeof payload.sub !== "string" || !Object.values(UserRole).includes(payload.role) || typeof payload.exp !== "number" || typeof payload.ver !== "number") {
      return null;
    }

    return payload.exp * 1000 > now ? payload : null;
  } catch {
    return null;
  }
}

export function readCookie(cookieHeader: string | null | undefined, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? cookie.slice(name.length + 1) : null;
}
