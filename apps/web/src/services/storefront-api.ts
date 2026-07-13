import { apiClient } from "./api-client";
import type { FeaturedProduct } from "../../lib/storefront-content";

export type ApiCategory = { id: string; name: string; slug: string; active?: boolean };
export type ApiVariant = { id: string; name: string; value: string; sku: string | null; active: boolean };
export type ApiStock = { id: string; availableQuantity: number; reservedQuantity: number } | null;
export type ApiProduct = { id: string; name: string; slug: string; description: string; priceCents: number; images: string[]; active: boolean; categories: ApiCategory[]; variants: ApiVariant[]; stock: ApiStock };
export type ApiOrder = { id: string; number: string; status: "CREATED" | "AWAITING_PAYMENT" | "PAID" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED"; createdAt: string; subtotalCents: number; shippingCents: number; totalCents: number; customer: { id: string; name: string; email: string | null; phone: string; document: string | null } | null; shippingAddress: { id: string; cep: string; street: string; number: string; complement: string | null; district: string; city: string; state: string; reference: string | null }; items: Array<{ id: string; productId: string; productName: string; quantity: number; unitPriceCents: number; variantId: string | null; totalCents: number }>; payment: { id: string; method: "PIX" | "CARD"; status: "PENDING" | "PAID" | "DECLINED" | "CANCELLED"; amountCents: number; externalReference: string | null; gatewayReference: string | null; provider: string | null; checkoutUrl: string | null; qrCodeText: string | null; qrCodeBase64: string | null; instructions: string[]; expiresAt: string | null } | null };
export type AdminProductInput = { name: string; slug: string; description: string; priceCents: number; images: string[]; categoryIds: string[]; variantName?: string; variantValue?: string; variantSku?: string; availableQuantity?: number; reservedQuantity?: number };
export type CreateOrderInput = { customer: { name: string; email?: string | null; phone: string; document?: string | null }; shippingAddress: { cep: string; street: string; number: string; complement?: string | null; district: string; city: string; state: string; reference?: string | null }; shippingRegion: "capital" | "interior" | "litoral"; paymentMethod: "PIX" | "CARD"; items: Array<{ productSlug: string; quantity: number; variantId?: string | null }> };

const json = (body: unknown, cookie?: string): RequestInit => ({ method: "POST", headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) });
const withCookie = (cookie?: string): RequestInit => cookie ? { headers: { cookie } } : {};

function toFeaturedProduct(product: ApiProduct): FeaturedProduct {
  return { slug: product.slug, name: product.name, description: product.description, priceCents: product.priceCents, badge: product.categories[0]?.name ?? "Em destaque", note: product.stock ? `${product.stock.availableQuantity} em estoque` : "Estoque sob consulta", categories: product.categories.map(({ slug, name }) => ({ slug, name })), details: [...product.categories.slice(0, 2).map((category) => category.name), ...product.variants.slice(0, 2).map((variant) => `${variant.name}: ${variant.value}`)], images: product.images, variants: product.variants.map(({ name, value, sku }) => ({ name, value, sku })), stock: product.stock };
}

async function read<T>(path: string, cookie?: string) { const result = await apiClient.request<T>(path, withCookie(cookie)); return result.ok ? result.data : null; }

export const storefrontService = {
  async getFeaturedProducts() { const products = await read<ApiProduct[]>("/products"); return products?.map(toFeaturedProduct) ?? []; },
  async getFeaturedProduct(slug: string) { const product = await read<ApiProduct>(`/products/${slug}`); return product ? toFeaturedProduct(product) : null; },
  getOrderByNumber: (number: string) => read<ApiOrder>(`/orders/number/${number}`),
  getVisitorOrders: (email: string, phone: string) => read<ApiOrder[]>(`/orders?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`),
  getAdminAuthMe: (cookie?: string) => read<{ authenticated: boolean; email?: string; role?: string }>("/admin/auth/me", cookie),
  getAdminOrders: (cookie?: string) => read<ApiOrder[]>("/admin/orders", cookie),
  getAdminProducts: (cookie?: string) => read<ApiProduct[]>("/admin/products", cookie),
  async getAdminProduct(id: string, cookie?: string) { return read<{ product: ApiProduct; categories: ApiCategory[] }>(`/admin/products/${id}`, cookie); },
  getCategories: () => read<ApiCategory[]>("/categories"),
  createOrder: (input: CreateOrderInput) => apiClient.request<ApiOrder>("/orders", json(input)),
  createAdminProduct: (input: AdminProductInput, cookie: string) => apiClient.request<ApiProduct>("/admin/products", json(input, cookie)),
  updateAdminProduct: (id: string, input: AdminProductInput, cookie: string) => apiClient.request<ApiProduct>(`/admin/products/${id}`, { ...json(input, cookie), method: "PATCH" }),
  updateAdminOrderStatus: (id: string, status: ApiOrder["status"], cookie: string) => apiClient.request<ApiOrder>(`/admin/orders/${id}/status`, { ...json({ status }, cookie), method: "PATCH" }),
  updateAdminProductStatus: (id: string, active: boolean, cookie: string) => apiClient.request<ApiProduct>(`/admin/products/${id}/status`, { ...json({ active }, cookie), method: "PATCH" }),
  adjustAdminProductStock: (id: string, delta: number, cookie: string) => apiClient.request<ApiProduct>(`/admin/products/${id}/stock`, { ...json({ delta }, cookie), method: "PATCH" }),
  deleteAdminProduct: (id: string, cookie: string) => apiClient.request<{ deleted: boolean }>(`/admin/products/${id}`, { method: "DELETE", headers: { cookie } }),
  deleteAdminOrder: (id: string, cookie: string) => apiClient.request<{ deleted: boolean }>(`/admin/orders/${id}`, { method: "DELETE", headers: { cookie } }),
  logout: (cookie: string) => apiClient.request<{ authenticated: boolean }>("/admin/auth/logout", { method: "POST", headers: { cookie } }),
  login: (email: string, password: string) => apiClient.request<{ authenticated: boolean; email?: string }>("/admin/auth/login", json({ email, password }))
};
