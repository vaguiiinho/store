import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "store_session";
const PUBLIC_PATHS = new Set(["/login"]);

/**
 * Checagem otimista: sem cookie de sessao, qualquer pagina leva ao /login.
 * A validacao real (assinatura, expiracao, papel) acontece no servidor via lib/session.ts e na API.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (PUBLIC_PATHS.has(pathname) || hasSession) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Ignora a API (servida pelo nginx), assets do Next e arquivos estaticos.
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml)$).*)"]
};
