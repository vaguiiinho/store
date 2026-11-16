import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";
import { DomainError } from "../../../shared/domain/errors/domain-error";
import { ShortName } from "../../../shared/domain/value-objects/short-name.value-object";
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
      ShortName.create(props.name, "Nome da categoria").value,
      Slug.create(props.slug, "Slug da categoria").value,
      props.active ?? true
    );
  }

  rename(name: string, slug: string) {
    this.name = ShortName.create(name, "Nome da categoria").value;
    this.slug = Slug.create(slug, "Slug da categoria").value;
  }

  ensureAssignable() {
    if (!this.active) {
      throw new DomainError("Categoria inativa.");
    }
  }

  deactivate() {
    this.active = false;
  }

  activate() {
    this.active = true;
  }
}
