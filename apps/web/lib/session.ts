// Fonte unica da sessao no servidor. A API valida a assinatura do cookie e o papel atual do usuario.
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { storefrontService, type SessionUser } from "../src/services/storefront-api";

export const SESSION_COOKIE_NAME = "store_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export async function getCookieHeader() {
  return (await cookies()).toString();
}

/** Deduplicada por request: layout, header e pagina podem chamar sem custo extra. */
export const getSession = cache(async (): Promise<(SessionUser & { primaryAdmin?: boolean }) | null> => {
  const me = await storefrontService.getAuthMe(await getCookieHeader());
  return me?.authenticated && me.user ? me.user : null;
});

export async function requireSession() {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireSession();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
