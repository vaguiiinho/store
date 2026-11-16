export type FeaturedProduct = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  badge: string;
  note: string;
  details: string[];
  categories: Array<{
    slug: string;
    name: string;
  }>;
  images?: string[];
  variants?: Array<{
    name: string;
    value: string;
    sku?: string | null;
  }>;
  stock?: {
    availableQuantity: number;
    reservedQuantity: number;
  } | null;
};
