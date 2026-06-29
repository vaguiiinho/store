import { Category } from "./category.entity";
import { Variant } from "./variant.entity";

export type ProductProps = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images?: string[];
  active?: boolean;
  categories?: Category[];
  variants?: Variant[];
};

export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public description: string,
    public priceCents: number,
    public images: string[] = [],
    public active = true,
    public categories: Category[] = [],
    public variants: Variant[] = []
  ) {}

  static create(props: ProductProps) {
    return new Product(
      props.id,
      props.name,
      props.slug,
      props.description,
      props.priceCents,
      props.images ?? [],
      props.active ?? true,
      props.categories ?? [],
      props.variants ?? []
    );
  }

  addCategory(category: Category) {
    if (this.categories.some((current) => current.id === category.id)) {
      return;
    }

    this.categories.push(category);
  }

  addVariant(variant: Variant) {
    if (this.variants.some((current) => current.id === variant.id)) {
      return;
    }

    this.variants.push(variant);
  }

  deactivate() {
    this.active = false;
  }

  activate() {
    this.active = true;
  }
}
