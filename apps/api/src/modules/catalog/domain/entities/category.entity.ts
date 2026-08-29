import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";
import { RequiredText } from "../../../shared/domain/value-objects/required-text.value-object";
import { Slug } from "../../../shared/domain/value-objects/slug.value-object";

export type CategoryProps = {
  id?: string;
  name: string;
  slug: string;
  active?: boolean;
};

export class Category {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public active = true
  ) {}

  static create(props: CategoryProps) {
    return new Category(
      EntityId.create(props.id, "ID da categoria").value,
      RequiredText.create(props.name, "Nome da categoria").value,
      Slug.create(props.slug, "Slug da categoria").value,
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
