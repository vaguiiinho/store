import { featuredProducts, type FeaturedProduct } from "./storefront-content";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  active?: boolean;
};

type ApiVariant = {
  id: string;
  name: string;
  value: string;
  sku: string | null;
  active: boolean;
};

type ApiStock = {
  id: string;
  availableQuantity: number;
  reservedQuantity: number;
} | null;

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images: string[];
  active: boolean;
  categories: ApiCategory[];
  variants: ApiVariant[];
  stock: ApiStock;
};

type ProductStock = {
  availableQuantity: number;
  reservedQuantity: number;
};

type StorefrontProduct = FeaturedProduct & {
  images: string[];
  variants: Array<{
    id: string;
    name: string;
    value: string;
    sku: string | null;
    active: boolean;
  }>;
  stock: ProductStock | null;
};

type ApiAdminProduct = ApiProduct;

type ApiAdminProductDetail = {
  product: ApiAdminProduct;
  categories: ApiCategory[];
};

type ApiOrderPayment = {
  id: string;
  method: "PIX" | "CARD";
  status: "PENDING" | "PAID" | "DECLINED" | "CANCELLED";
  amountCents: number;
  externalReference: string | null;
  gatewayReference: string | null;
  provider: string | null;
  checkoutUrl: string | null;
  qrCodeText: string | null;
  qrCodeBase64: string | null;
  instructions: string[];
  expiresAt: string | null;
};

type ApiOrder = {
  id: string;
  number: string;
  status: "CREATED" | "AWAITING_PAYMENT" | "PAID" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    document: string | null;
  } | null;
  shippingAddress: {
    id: string;
    cep: string;
    street: string;
    number: string;
    complement: string | null;
    district: string;
    city: string;
    state: string;
    reference: string | null;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPriceCents: number;
    variantId: string | null;
    totalCents: number;
  }>;
  payment: ApiOrderPayment | null;
};

const apiBaseUrl = process.env.API_URL ?? "http://localhost:3001/api";

async function fetchApi<T>(path: string, cookieHeader?: string) {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: "no-store",
      headers: cookieHeader
        ? {
            cookie: cookieHeader
          }
        : undefined
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function toFeaturedProduct(product: ApiProduct): StorefrontProduct {
  const badge = product.categories[0]?.name ?? "Em destaque";
  const note =
    product.stock && product.stock.availableQuantity > 0
      ? `${product.stock.availableQuantity} em estoque`
      : "Estoque sob consulta";

  const details = [
    ...product.categories.slice(0, 2).map((category) => category.name),
    ...product.variants.slice(0, 2).map((variant) => `${variant.name}: ${variant.value}`)
  ];

  if (product.images.length > 0) {
    details.push("Imagem principal disponível");
  }

  if (product.stock) {
    details.push(`Reserva: ${product.stock.reservedQuantity}`);
  }

  return {
    slug: product.slug,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    badge,
    note,
    categories: product.categories.map((category) => ({
      slug: category.slug,
      name: category.name
    })),
    details: details.length > 0 ? details : ["Conteúdo inicial do catálogo"],
    images: product.images,
    variants: product.variants,
    stock: product.stock
      ? {
          availableQuantity: product.stock.availableQuantity,
          reservedQuantity: product.stock.reservedQuantity
        }
      : null
  };
}

function findFallbackProduct(slug: string): StorefrontProduct | null {
  const product = featuredProducts.find((item) => item.slug === slug);

  if (!product) {
    return null;
  }

  return {
    ...product,
    images: product.images ?? [],
    variants:
      product.variants?.map((variant, index) => ({
        id: `${product.slug}-variant-${index + 1}`,
        name: variant.name,
        value: variant.value,
        sku: variant.sku ?? null,
        active: true
      })) ?? [],
    stock: product.stock ?? null
  };
}

function enrichProducts(products: ApiProduct[]) {
  return products.map((product) => {
    const fallback = findFallbackProduct(product.slug);

    if (!fallback) {
      return toFeaturedProduct(product);
    }

    return {
      ...fallback,
      ...toFeaturedProduct(product),
      images: product.images.length > 0 ? product.images : fallback.images,
      stock: product.stock
        ? {
            availableQuantity: product.stock.availableQuantity,
            reservedQuantity: product.stock.reservedQuantity
          }
        : fallback.stock
    };
  });
}

export async function getFeaturedProducts() {
  const products = await fetchApi<ApiProduct[]>("/products");

  if (!products || products.length === 0) {
    return featuredProducts.map((product) => findFallbackProduct(product.slug) ?? product);
  }

  return enrichProducts(products);
}

export async function getFeaturedProduct(slug: string) {
  const product = await fetchApi<ApiProduct>(`/products/${slug}`);

  if (product) {
    return enrichProducts([product])[0] ?? findFallbackProduct(slug);
  }

  return findFallbackProduct(slug);
}

export async function getOrderByNumber(number: string) {
  return fetchApi<ApiOrder>(`/orders/number/${number}`);
}

export async function getAdminAuthMe(cookieHeader?: string) {
  return fetchApi<{ authenticated: boolean; email?: string; role?: string }>("/admin/auth/me", cookieHeader);
}

export async function getAdminOrders(cookieHeader?: string) {
  return fetchApi<ApiOrder[]>("/admin/orders", cookieHeader);
}

export async function updateAdminOrderStatus(orderId: string, status: ApiOrder["status"]) {
  try {
    const response = await fetch(`${apiBaseUrl}/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ApiOrder;
  } catch {
    return null;
  }
}

export async function getAdminProducts(cookieHeader?: string) {
  return fetchApi<ApiAdminProduct[]>("/admin/products", cookieHeader);
}

export async function getAdminProduct(id: string, cookieHeader?: string) {
  return fetchApi<ApiAdminProductDetail>(`/admin/products/${id}`, cookieHeader);
}

export async function getCategories() {
  return fetchApi<ApiCategory[]>("/categories");
}

export async function createAdminProduct(input: {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images: string[];
  categoryIds: string[];
  variantName?: string;
  variantValue?: string;
  variantSku?: string;
  availableQuantity?: number;
  reservedQuantity?: number;
}) {
  try {
    const response = await fetch(`${apiBaseUrl}/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ApiAdminProduct;
  } catch {
    return null;
  }
}

export async function updateAdminProduct(
  id: string,
  input: {
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    images: string[];
    categoryIds: string[];
    variantName?: string;
    variantValue?: string;
    variantSku?: string;
    availableQuantity?: number;
    reservedQuantity?: number;
  }
) {
  try {
    const response = await fetch(`${apiBaseUrl}/admin/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ApiAdminProduct;
  } catch {
    return null;
  }
}
