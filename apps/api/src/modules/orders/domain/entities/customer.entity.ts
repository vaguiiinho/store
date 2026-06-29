export type CustomerProps = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  document?: string | null;
};

export class Customer {
  constructor(
    public readonly id: string,
    public name: string,
    public phone: string,
    public email: string | null = null,
    public document: string | null = null
  ) {}

  static create(props: CustomerProps) {
    return new Customer(
      props.id,
      props.name,
      props.phone,
      props.email ?? null,
      props.document ?? null
    );
  }
}
