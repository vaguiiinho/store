import { toUnitOutput, UnitOutput } from "../../inventory/application/unit.output";
import { Product } from "../domain/entities/product.entity";
import { CategoryOutput, toCategoryOutput } from "./category.output";

export type AdminProductOutput = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images: string[];
  active: boolean;
  category: CategoryOutput;
  variants: Array<{ id: string; name: string; value: string; sku: string | null; active: boolean }>;
  stock: { id: string; availableQuantity: number; reservedQuantity: number; unit: UnitOutput } | null;
};

export function toAdminProductOutput(product: Product): AdminProductOutput {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceCents: product.priceCents,
    images: [...product.images],
    active: product.active,
    category: toCategoryOutput(product.category),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      value: variant.value,
      sku: variant.sku,
      active: variant.active
    })),
    stock: product.stock
      ? {
          id: product.stock.id,
          availableQuantity: product.stock.available,
          reservedQuantity: product.stock.reserved,
          unit: toUnitOutput(product.stock.unit)
        }
      : null
  };
}
