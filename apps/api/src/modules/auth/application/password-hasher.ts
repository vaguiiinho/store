import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keyLength: number) => Promise<Buffer>;
const KEY_LENGTH = 64;
const PREFIX = "scrypt";

/** Formato: scrypt$<salt base64url>$<hash base64url>. Usa somente node:crypto (sem dependencia nova). */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return `${PREFIX}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [prefix, saltPart, hashPart] = stored.split("$");

  if (prefix !== PREFIX || !saltPart || !hashPart) {
    return false;
  }

  const expected = Buffer.from(hashPart, "base64url");
  const actual = await scrypt(password, Buffer.from(saltPart, "base64url"), expected.length);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Hash valido usado quando o e-mail nao existe, para manter o tempo de resposta parecido. */
export const DUMMY_PASSWORD_HASH = "scrypt$AAAAAAAAAAAAAAAAAAAAAA$" + Buffer.alloc(KEY_LENGTH).toString("base64url");
