import { Category } from "./category.entity";
import { Stock } from "../../../inventory/domain/entities/stock.entity";
import { Variant } from "./variant.entity";
import { Money } from "../../../shared/domain/value-objects/money.value-object";
import { RequiredText } from "../../../shared/domain/value-objects/required-text.value-object";
import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";
import { Slug } from "../../../shared/domain/value-objects/slug.value-object";
import { DomainError } from "../../../shared/domain/errors/domain-error";

export type ProductProps = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images?: string[];
  active?: boolean;
  categories?: Category[];
  variants?: Variant[];
  stock?: Stock | null;
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
    public variants: Variant[] = [],
    public stock: Stock | null = null
  ) {}

  static create(props: ProductProps) {
    const name = RequiredText.create(props.name, "Nome do produto");
    const slug = Slug.create(props.slug, "Slug do produto");
    const description = RequiredText.create(props.description, "Descricao do produto");
    const price = Money.create(props.priceCents, "Preco do produto");

    return new Product(
      EntityId.create(props.id, "ID do produto").value,
      name.value,
      slug.value,
      description.value,
      price.cents,
      Product.normalizeImages(props.images ?? []),
      props.active ?? true,
      props.categories ?? [],
      props.variants ?? [],
      props.stock ?? null
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

  updateDetails(input: Pick<ProductProps, "name" | "slug" | "description" | "priceCents" | "images">) {
    this.name = RequiredText.create(input.name, "Nome do produto").value;
    this.slug = Slug.create(input.slug, "Slug do produto").value;
    this.description = RequiredText.create(input.description, "Descricao do produto").value;
    this.priceCents = Money.create(input.priceCents, "Preco do produto").cents;
    this.images = Product.normalizeImages(input.images ?? []);
  }

  deactivate() {
    this.active = false;
  }

  activate() {
    this.active = true;
  }

  private static normalizeImages(images: string[]) {
    return images.map((image) => {
      const normalized = image.trim();
      try {
        const url = new URL(normalized);
        if (url.protocol !== "https:") throw new Error();
      } catch {
        throw new DomainError("Imagem do produto deve ser uma URL HTTPS valida.");
      }
      return normalized;
    });
  }
}
