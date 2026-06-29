import { featuredProducts, type FeaturedProduct } from "./storefront-content";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
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

const apiBaseUrl = process.env.API_URL ?? "http://localhost:3001/api";

async function fetchApi<T>(path: string) {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function toFeaturedProduct(product: ApiProduct): FeaturedProduct {
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
    details: details.length > 0 ? details : ["Conteúdo inicial do catálogo"]
  };
}

function findFallbackProduct(slug: string) {
  return featuredProducts.find((product) => product.slug === slug) ?? null;
}

export async function getFeaturedProducts() {
  const products = await fetchApi<ApiProduct[]>("/products");

  if (!products || products.length === 0) {
    return featuredProducts;
  }

  return products.map(toFeaturedProduct);
}

export async function getFeaturedProduct(slug: string) {
  const product = await fetchApi<ApiProduct>(`/products/${slug}`);

  if (product) {
    return toFeaturedProduct(product);
  }

  return findFallbackProduct(slug);
}
