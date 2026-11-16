"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { storefrontService, type AdminProductInput, type ApiOrder, type ApiUser, type CreateOrderInput, type CreateUserInput, type SessionUser, type UpdateUserInput } from "../../src/services/storefront-api";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "../../lib/session";

type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; message: string };

async function cookieHeader() {
  return (await cookies()).toString();
}

function result<T>(response: { ok: boolean; data?: T; message?: string }): ActionResult<T> {
  return response.ok ? { ok: true, data: response.data } : { ok: false, message: response.message ?? "Nao foi possivel concluir a solicitacao." };
}

export async function createOrderAction(input: CreateOrderInput): Promise<ActionResult<ApiOrder>> {
  const response = await storefrontService.createOrder(input, await cookieHeader());
  if (response.ok) revalidatePath("/");
  return result(response);
}

function hasControlChar(value: string) {
  return [...value].some((char) => char.charCodeAt(0) < 0x20 || char.charCodeAt(0) === 0x7f);
}

/** Destino seguro apos login: somente caminhos internos (evita open redirect). */
function safeNextPath(next: string | null | undefined) {
  if (!next || !/^\/(?![/\\])/.test(next) || next.includes("\\") || hasControlChar(next)) return "/";
  const origin = "http://internal.invalid";
  const url = new URL(next, origin);
  if (url.origin !== origin || url.pathname.startsWith("/login")) return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}

export async function loginAction(email: string, password: string, next?: string | null): Promise<ActionResult<{ user: SessionUser; redirectTo: string }>> {
  const response = await storefrontService.login(email, password);
  if (!response.ok) return { ok: false, message: response.status === 401 ? "E-mail ou senha invalidos." : response.message };

  if (!(await storeSessionCookie(response.headers))) return { ok: false, message: "A sessao nao foi criada." };
  return { ok: true, data: { user: response.data.user, redirectTo: safeNextPath(next) } };
}

/** Copia o cookie de sessao emitido pela API para o dominio da web. */
async function storeSessionCookie(headers: Headers) {
  const nameValue = headers.get("set-cookie")?.split(";")[0] ?? "";
  const separator = nameValue.indexOf("=");
  if (separator <= 0 || nameValue.slice(0, separator) !== SESSION_COOKIE_NAME) return false;

  (await cookies()).set(SESSION_COOKIE_NAME, nameValue.slice(separator + 1), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: (process.env.NEXT_PUBLIC_APP_URL ?? "").startsWith("https://")
  });
  return true;
}

export async function changeOwnPasswordAction(currentPassword: string, newPassword: string): Promise<ActionResult> {
  const response = await storefrontService.changeOwnPassword(currentPassword, newPassword, await cookieHeader());
  if (!response.ok) return { ok: false, message: response.message };
  // A API invalida as sessoes antigas e devolve um cookie novo para esta sessao.
  await storeSessionCookie(response.headers);
  return { ok: true };
}

export async function updateUserAction(id: string, input: UpdateUserInput): Promise<ActionResult<ApiUser>> {
  const response = await storefrontService.updateAdminUser(id, input, await cookieHeader());
  if (response.ok) revalidatePath("/admin/usuarios", "layout");
  return result(response);
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  const response = await storefrontService.deleteAdminUser(id, await cookieHeader());
  if (response.ok) revalidatePath("/admin/usuarios", "layout");
  return response.ok ? { ok: true } : { ok: false, message: response.message };
}

export async function setUserActiveAction(id: string, active: boolean): Promise<ActionResult> {
  const response = await storefrontService.setAdminUserActive(id, active, await cookieHeader());
  if (response.ok) revalidatePath("/admin/usuarios", "layout");
  return response.ok ? { ok: true } : { ok: false, message: response.message };
}

export async function adminSetUserPasswordAction(id: string, newPassword: string): Promise<ActionResult> {
  const response = await storefrontService.setAdminUserPassword(id, newPassword, await cookieHeader());
  return response.ok ? { ok: true } : { ok: false, message: response.message };
}

export async function logoutAction(): Promise<ActionResult> {
  await storefrontService.logout(await cookieHeader());
  (await cookies()).delete(SESSION_COOKIE_NAME);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createUserAction(input: CreateUserInput): Promise<ActionResult<ApiUser>> {
  const response = await storefrontService.createAdminUser(input, await cookieHeader());
  if (response.ok) revalidatePath("/admin/usuarios");
  return result(response);
}

export async function saveAdminProductAction(id: string | null, input: AdminProductInput): Promise<ActionResult<{ id: string }>> {
  const response = id ? await storefrontService.updateAdminProduct(id, input, await cookieHeader()) : await storefrontService.createAdminProduct(input, await cookieHeader());
  if (response.ok) {
    revalidatePath("/admin/produtos");
    revalidatePath("/");
  }
  return result(response);
}

export async function updateAdminOrderStatusAction(id: string, status: ApiOrder["status"]): Promise<ActionResult> {
  const response = await storefrontService.updateAdminOrderStatus(id, status, await cookieHeader());
  if (response.ok) revalidatePath("/admin/pedidos");
  return response.ok ? { ok: true } : { ok: false, message: response.message };
}

export async function updateAdminProductStatusAction(id: string, active: boolean): Promise<ActionResult> {
  const response = await storefrontService.updateAdminProductStatus(id, active, await cookieHeader());
  if (response.ok) revalidatePath("/admin/produtos");
  return response.ok ? { ok: true } : { ok: false, message: response.message };
}

export async function adjustAdminProductStockAction(id: string, delta: number): Promise<ActionResult> {
  const response = await storefrontService.adjustAdminProductStock(id, delta, await cookieHeader());
  if (response.ok) revalidatePath("/admin/produtos");
  return response.ok ? { ok: true } : { ok: false, message: response.message };
}

export async function deleteAdminProductAction(id: string): Promise<ActionResult> {
  const response = await storefrontService.deleteAdminProduct(id, await cookieHeader());
  if (response.ok) revalidatePath("/admin/produtos");
  return response.ok ? { ok: true } : { ok: false, message: response.message };
}

export async function deleteAdminOrderAction(id: string): Promise<ActionResult> {
  const response = await storefrontService.deleteAdminOrder(id, await cookieHeader());
  if (response.ok) revalidatePath("/admin/pedidos");
  return response.ok ? { ok: true } : { ok: false, message: response.message };
}
