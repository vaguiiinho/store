"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { storefrontService, type AdminProductInput, type ApiOrder, type CreateOrderInput } from "../../src/services/storefront-api";

type ActionResult<T = void> = { ok: true; data?: T } | { ok: false; message: string };

async function cookieHeader() {
  return (await cookies()).toString();
}

function result<T>(response: { ok: boolean; data?: T; message?: string }): ActionResult<T> {
  return response.ok ? { ok: true, data: response.data } : { ok: false, message: response.message ?? "Nao foi possivel concluir a solicitacao." };
}

export async function createOrderAction(input: CreateOrderInput): Promise<ActionResult<ApiOrder>> {
  const response = await storefrontService.createOrder(input);
  if (response.ok) revalidatePath("/catalogo");
  return result(response);
}

export async function loginAdminAction(email: string, password: string): Promise<ActionResult> {
  const response = await storefrontService.login(email, password);
  if (!response.ok || !response.data.authenticated) return { ok: false, message: response.ok ? "Credenciais invalidas." : response.message };

  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) return { ok: false, message: "A sessao nao foi criada." };
  const [nameValue] = setCookie.split(";");
  const separator = nameValue.indexOf("=");
  if (separator <= 0) return { ok: false, message: "Cookie de sessao invalido." };
  (await cookies()).set(nameValue.slice(0, separator), nameValue.slice(separator + 1), { httpOnly: true, sameSite: "lax", path: "/" });
  return { ok: true };
}

export async function logoutAdminAction(): Promise<ActionResult> {
  const response = await storefrontService.logout(await cookieHeader());
  if (!response.ok) return { ok: false, message: response.message };
  (await cookies()).delete("store_admin_session");
  revalidatePath("/");
  return { ok: true };
}

export async function saveAdminProductAction(id: string | null, input: AdminProductInput): Promise<ActionResult<{ id: string }>> {
  const response = id ? await storefrontService.updateAdminProduct(id, input, await cookieHeader()) : await storefrontService.createAdminProduct(input, await cookieHeader());
  if (response.ok) revalidatePath("/admin");
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
