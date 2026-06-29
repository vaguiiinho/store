export type AddressProps = {
  id: string;
  cep: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  reference?: string | null;
  customerId?: string | null;
};

export class Address {
  constructor(
    public readonly id: string,
    public cep: string,
    public street: string,
    public number: string,
    public complement: string | null,
    public district: string,
    public city: string,
    public state: string,
    public reference: string | null = null,
    public readonly customerId: string | null = null
  ) {}

  static create(props: AddressProps) {
    return new Address(
      props.id,
      props.cep,
      props.street,
      props.number,
      props.complement ?? null,
      props.district,
      props.city,
      props.state,
      props.reference ?? null,
      props.customerId ?? null
    );
  }
}
