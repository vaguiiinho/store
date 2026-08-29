import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";
import { RequiredText } from "../../../shared/domain/value-objects/required-text.value-object";

export type VariantProps = {
  id?: string;
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
      EntityId.create(props.id, "ID da variacao").value,
      EntityId.create(props.productId, "ID do produto da variacao").value,
      RequiredText.create(props.name, "Nome da variacao").value,
      RequiredText.create(props.value, "Valor da variacao").value,
      props.sku?.trim() || null,
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
