export type VariantProps = {
  id: string;
  productId: string;
  name: string;
  value: string;
  sku?: string | null;
  active?: boolean;
};

export class Variant {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public name: string,
    public value: string,
    public sku: string | null = null,
    public active = true
  ) {}

  static create(props: VariantProps) {
    return new Variant(
      props.id,
      props.productId,
      props.name,
      props.value,
      props.sku ?? null,
      props.active ?? true
    );
  }

  deactivate() {
    this.active = false;
  }

  activate() {
    this.active = true;
  }
}
