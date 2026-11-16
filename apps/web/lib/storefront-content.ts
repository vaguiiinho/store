export type FeaturedProduct = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  badge: string;
  note: string;
  details: string[];
  category: {
    slug: string;
    name: string;
  } | null;
  images?: string[];
  variants?: Array<{
    name: string;
    value: string;
    sku?: string | null;
  }>;
  stock?: {
    availableQuantity: number;
    reservedQuantity: number;
    unit?: { id: string; name: string; abbreviation: string };
  } | null;
};
