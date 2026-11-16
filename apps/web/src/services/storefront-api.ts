import { apiClient } from "./api-client";
import type { FeaturedProduct } from "../../lib/storefront-content";

export type ApiCategory = { id: string; name: string; slug: string; active?: boolean };
export type ApiVariant = { id: string; name: string; value: string; sku: string | null; active: boolean };
export type ApiUnit = { id: string; name: string; abbreviation: string; active?: boolean };
export type ApiStock = { id: string; availableQuantity: number; reservedQuantity: number; unit: ApiUnit } | null;
export type AdminCategory = { id: string; name: string; slug: string; active: boolean; productCount: number };
export type AdminUnit = { id: string; name: string; abbreviation: string; active: boolean; stockCount: number };
export type AdminCategoryInput = { name: string; slug: string; active?: boolean };
export type AdminUnitInput = { name: string; abbreviation: string; active?: boolean };
export type ApiProduct = { id: string; name: string; slug: string; description: string; priceCents: number; images: string[]; active: boolean; category: ApiCategory; variants: ApiVariant[]; stock: ApiStock };
export type ApiOrder = { id: string; number: string; status: "CREATED" | "AWAITING_PAYMENT" | "PAID" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED"; createdAt: string; subtotalCents: number; shippingCents: number; totalCents: number; customer: { id: string; name: string; email: string | null; phone: string; document: string | null } | null; shippingAddress: { id: string; cep: string; street: string; number: string; complement: string | null; district: string; city: string; state: string; reference: string | null }; items: Array<{ id: string; productId: string; productName: string; quantity: number; unitPriceCents: number; variantId: string | null; totalCents: number }>; payment: { id: string; method: "PIX" | "CARD"; status: "PENDING" | "PAID" | "DECLINED" | "CANCELLED"; amountCents: number; externalReference: string | null; gatewayReference: string | null; provider: string | null; checkoutUrl: string | null; qrCodeText: string | null; qrCodeBase64: string | null; instructions: string[]; expiresAt: string | null } | null };
/** Espelha GetAdminOrderSummaryOutput de GET /admin/orders/summary (periodDays fixo em 30). */
export type AdminOrderSummary = { totalOrders: number; awaitingPayment: number; inProgress: number; delivered: number; cancelled: number; revenueCents: number; periodDays: number; periodStart: string; ordersInPeriod: number };
export type UserRole = "USER" | "ADMIN";
export type SessionUser = { id: string; name: string; email: string; role: UserRole };
export type AuthMe = { authenticated: boolean; user?: SessionUser & { primaryAdmin?: boolean } };
export type ApiUser = SessionUser & { active: boolean; primaryAdmin: boolean; createdAt: string };
export type CreateUserInput = { name: string; email: string; password: string; role: UserRole };
export type UpdateUserInput = { name?: string; email?: string; role?: UserRole };
export type AdminProductInput = { name: string; slug: string; description: string; priceCents: number; images: string[]; categoryId: string; unitId?: string };
export type CreateOrderInput = { customer: { name: string; email?: string | null; phone: string; document?: string | null }; shippingAddress: { cep: string; street: string; number: string; complement?: string | null; district: string; city: string; state: string; reference?: string | null }; shippingRegion: "capital" | "interior" | "litoral"; paymentMethod: "PIX" | "CARD"; items: Array<{ productSlug: string; quantity: number; variantId?: string | null }> };

const json = (body: unknown, cookie?: string): RequestInit => ({ method: "POST", headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) });
const withCookie = (cookie?: string): RequestInit => cookie ? { headers: { cookie } } : {};

function toFeaturedProduct(product: ApiProduct): FeaturedProduct {
  return { slug: product.slug, name: product.name, description: product.description, priceCents: product.priceCents, badge: product.category?.name ?? "Em destaque", note: product.stock ? (product.stock.availableQuantity > 0 ? "Disponível" : "Sem estoque") : "Disponibilidade sob consulta", category: product.category ? { slug: product.category.slug, name: product.category.name } : null, details: [...(product.category ? [product.category.name] : []), ...product.variants.slice(0, 2).map((variant) => `${variant.name}: ${variant.value}`)], images: product.images, variants: product.variants.map(({ name, value, sku }) => ({ name, value, sku })), stock: product.stock };
}

async function read<T>(path: string, cookie?: string) { const result = await apiClient.request<T>(path, withCookie(cookie)); return result.ok ? result.data : null; }

export const storefrontService = {
  async getFeaturedProducts() { const products = await read<ApiProduct[]>("/products"); return products?.map(toFeaturedProduct) ?? []; },
  async getFeaturedProduct(slug: string) { const product = await read<ApiProduct>(`/products/${slug}`); return product ? toFeaturedProduct(product) : null; },
  getOrderByNumber: (number: string, cookie: string) => read<ApiOrder>(`/orders/number/${encodeURIComponent(number)}`, cookie),
  getMyOrders: (cookie: string) => read<ApiOrder[]>("/orders", cookie),
  getAuthMe: (cookie?: string) => read<AuthMe>("/auth/me", cookie),
  getAdminUsers: (cookie: string) => read<ApiUser[]>("/admin/users", cookie),
  getAdminUser: (id: string, cookie: string) => read<ApiUser>(`/admin/users/${encodeURIComponent(id)}`, cookie),
  getAdminUserOrders: (id: string, cookie: string) => read<ApiOrder[]>(`/admin/users/${encodeURIComponent(id)}/orders`, cookie),
  updateAdminUser: (id: string, input: UpdateUserInput, cookie: string) => apiClient.request<ApiUser>(`/admin/users/${encodeURIComponent(id)}`, { ...json(input, cookie), method: "PATCH" }),
  deleteAdminUser: (id: string, cookie: string) => apiClient.request<{ deleted: boolean }>(`/admin/users/${encodeURIComponent(id)}`, { method: "DELETE", headers: { cookie } }),
  createAdminUser: (input: CreateUserInput, cookie: string) => apiClient.request<ApiUser>("/admin/users", json(input, cookie)),
  setAdminUserActive: (id: string, active: boolean, cookie: string) => apiClient.request<ApiUser>(`/admin/users/${encodeURIComponent(id)}/status`, { ...json({ active }, cookie), method: "PATCH" }),
  setAdminUserPassword: (id: string, newPassword: string, cookie: string) => apiClient.request<ApiUser>(`/admin/users/${encodeURIComponent(id)}/password`, { ...json({ newPassword }, cookie), method: "PATCH" }),
  changeOwnPassword: (currentPassword: string, newPassword: string, cookie: string) => apiClient.request<{ changed: boolean }>("/auth/password", { ...json({ currentPassword, newPassword }, cookie), method: "PATCH" }),
  getAdminOrders: (cookie?: string) => read<ApiOrder[]>("/admin/orders", cookie),
  /** Devolve o resultado cru para o chamador distinguir 403 (papel rebaixado) de falha de rede. */
  getAdminOrderSummary: (cookie?: string) => apiClient.request<AdminOrderSummary>("/admin/orders/summary", withCookie(cookie)),
  getAdminProducts: (cookie?: string) => read<ApiProduct[]>("/admin/products", cookie),
  async getAdminProduct(id: string, cookie?: string) { return read<{ product: ApiProduct; categories: ApiCategory[] }>(`/admin/products/${id}`, cookie); },
  getAdminCategories: (cookie?: string) => read<AdminCategory[]>("/admin/categories", cookie),
  createAdminCategory: (input: AdminCategoryInput, cookie: string) => apiClient.request<AdminCategory>("/admin/categories", json({ name: input.name, slug: input.slug }, cookie)),
  updateAdminCategory: (id: string, input: AdminCategoryInput, cookie: string) => apiClient.request<AdminCategory>(`/admin/categories/${encodeURIComponent(id)}`, { ...json({ name: input.name, slug: input.slug, active: input.active }, cookie), method: "PATCH" }),
  deleteAdminCategory: (id: string, cookie: string) => apiClient.request<{ deleted: boolean }>(`/admin/categories/${encodeURIComponent(id)}`, { method: "DELETE", headers: { cookie } }),
  getAdminUnits: (cookie?: string) => read<AdminUnit[]>("/admin/measurement-units", cookie),
  createAdminUnit: (input: AdminUnitInput, cookie: string) => apiClient.request<AdminUnit>("/admin/measurement-units", json({ name: input.name, abbreviation: input.abbreviation }, cookie)),
  updateAdminUnit: (id: string, input: AdminUnitInput, cookie: string) => apiClient.request<AdminUnit>(`/admin/measurement-units/${encodeURIComponent(id)}`, { ...json({ name: input.name, abbreviation: input.abbreviation, active: input.active }, cookie), method: "PATCH" }),
  deleteAdminUnit: (id: string, cookie: string) => apiClient.request<{ deleted: boolean }>(`/admin/measurement-units/${encodeURIComponent(id)}`, { method: "DELETE", headers: { cookie } }),
  changeAdminStockUnit: (productId: string, unitId: string, cookie: string) => apiClient.request<{ productId: string; stockId: string; unit: ApiUnit }>(`/admin/products/${encodeURIComponent(productId)}/stock/unit`, { ...json({ unitId }, cookie), method: "PATCH" }),
  getCategories: () => read<ApiCategory[]>("/categories"),
  createOrder: (input: CreateOrderInput, cookie: string) => apiClient.request<ApiOrder>("/orders", json(input, cookie)),
  createAdminProduct: (input: AdminProductInput, cookie: string) => apiClient.request<ApiProduct>("/admin/products", json(input, cookie)),
  updateAdminProduct: (id: string, input: AdminProductInput, cookie: string) => apiClient.request<ApiProduct>(`/admin/products/${encodeURIComponent(id)}`, { ...json(input, cookie), method: "PATCH" }),
  updateAdminOrderStatus: (id: string, status: ApiOrder["status"], cookie: string) => apiClient.request<ApiOrder>(`/admin/orders/${id}/status`, { ...json({ status }, cookie), method: "PATCH" }),
  updateAdminProductStatus: (id: string, active: boolean, cookie: string) => apiClient.request<ApiProduct>(`/admin/products/${id}/status`, { ...json({ active }, cookie), method: "PATCH" }),
  adjustAdminProductStock: (id: string, delta: number, cookie: string) => apiClient.request<ApiProduct>(`/admin/products/${id}/stock`, { ...json({ delta }, cookie), method: "PATCH" }),
  deleteAdminProduct: (id: string, cookie: string) => apiClient.request<{ deleted: boolean }>(`/admin/products/${id}`, { method: "DELETE", headers: { cookie } }),
  deleteAdminOrder: (id: string, cookie: string) => apiClient.request<{ deleted: boolean }>(`/admin/orders/${id}`, { method: "DELETE", headers: { cookie } }),
  logout: (cookie: string) => apiClient.request<{ authenticated: boolean }>("/auth/logout", { method: "POST", headers: { cookie } }),
  login: (email: string, password: string) => apiClient.request<{ authenticated: boolean; user: SessionUser }>("/auth/login", json({ email, password }))
};
