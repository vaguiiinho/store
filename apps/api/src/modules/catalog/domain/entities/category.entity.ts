export type CategoryProps = {
  id: string;
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
    return new Category(props.id, props.name, props.slug, props.active ?? true);
  }

  deactivate() {
    this.active = false;
  }

  activate() {
    this.active = true;
  }
}
